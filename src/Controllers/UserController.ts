import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { UserLoginRequestModel, UserRegisterRequestModel } from '../Models/API_Requests/API_Request_Models';
import { APIErrorCode, CommonErrorCode, CommonSuccessCode } from '../Models/Common/ErrorCodes';
import { APIRequestHandler } from '../Utils/API_Request_Handler';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_UserModel, DB_UserType } from '../Models/Database/DB_UserModel';
import { DB_TableName } from '../Configurations/Conf_MongoDB';
import { AuthenticationHandler } from '../Utils/User_Authentication_Handler';
import { DateHandler } from '../Utils/Date_Handler';
import { AuthTokenConf } from '../Configurations/Conf_Authentication';

type UserID = Pick<DB_UserModel, "username">

export class UserController
{
    static async UserLogin(req :Request, res: Response, next: NextFunction)
    {
        try{
            let loginReq = req.body as UserLoginRequestModel
            if(!APIRequestHandler.AreParamsValid(loginReq.password, loginReq.username))
            {
                throw {
                    message: "User login failed - please provide username AND password",
                    code: APIErrorCode.UserLoginRequest_MissingUsernameOrPassword
                }
            }
            
            
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            
            
            //Check if user exists
            const usersData = db.collection<DB_UserModel>("UserData")
            const targetUser = await usersData.findOne(
                // {username: registerReq.username}
                {username: loginReq.username}
            )
            
            
            //Check if provided credentials are correct
            {
                //Check if username exists
                if (targetUser == null)
                {
                    throw {
                        message: "user login failed, provided credentials are incorrect",
                        code: APIErrorCode.UserLoginRequest_UsernameOrPasswordIsIncorrect
                    }
                }
                //If username exists, check if the password is correct
                const passwordIsCorrect:boolean = await AuthenticationHandler.ComparePassword(loginReq.password, targetUser.hashed_password)
                if (!passwordIsCorrect)
                {
                    throw {
                        message: "user login failed, provided credentials are incorrect",
                        code: APIErrorCode.UserLoginRequest_UsernameOrPasswordIsIncorrect
                    }
                }
            }
            
            //Generate authentication token & update to user
            const authToken:string = await AuthenticationHandler.GenerateRandomAuthToken()
            const authToken_epiretime = DateHandler.GetDateTimeXHoursFromNow(AuthTokenConf.AuthToken_Duration_Hours)
            const updateResult = await usersData.updateOne(
                {username: loginReq.username}, 
                {
                    $set: {
                        authentication: {
                            accessToken: authToken,
                            expireTime: authToken_epiretime.toISOString()
                        }
                    }
                }
            )
            if (!updateResult.acknowledged)
            {
                throw {
                    message: `Failed to update user ${loginReq.username} auth token`,
                    code: APIErrorCode.UserLoginRequest_CannotUpdateUserAuthToken
                }
            }
            
            
            res.send({
                message: "User login success!!",
                // provided_username: loginReq.username,
                // provided_password: loginReq.password,//for testing
                authToken: authToken,
                authToken_epiretime: authToken_epiretime.toISOString(),
                code: CommonSuccessCode.APIRequestSuccess 
            })
            next()
        }catch(e:any)
        {
            res.send({
                message: e.message,
                code: e.code
            })
        }
    }
    
    static async UserRegister(req :Request, res: Response, next: NextFunction)
    {
        try {
            let registerReq = req.body as UserRegisterRequestModel 
            if(!APIRequestHandler.AreParamsValid(registerReq.password, registerReq.username))
            {
                throw {
                    message: "User registeration failed - please provide username AND passowrd",
                    code: APIErrorCode.UserRegisterRequest_MissingUsernameOrPassword
                }
            }
            
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            
            //Check if user already exists
            const usersData = db.collection<DB_UserModel>("UserData")
            const targetUser = await usersData.findOne<UserID>(
                // {username: registerReq.username}
                {username: registerReq.username}
            )
            
            if (targetUser != null)
            {
                throw {
                    message: "User registeration failed - user already exist",
                    code: APIErrorCode.UserRegisterRequest_UserAlreadyExist
                }
            }
            
            //Register new user
            const insertResult = await usersData.insertOne({
                username: registerReq.username,
                hashed_password: await AuthenticationHandler.HashPassword(registerReq.password), //TODO: hash this
                user_type: DB_UserType.User
            })
            
            if (!insertResult.acknowledged)
            {
                throw {
                    message: "User registeration failed - failed to insert new user data to db",
                    code: APIErrorCode.UserRegisterRequest_FailedToInsertNewUserData
                }
            }
            
            
            
            
            res.send({
                message: "User registeration success",
                // provided_username: registerReq.username,
                // provided_password: registerReq.password,//for testing
                code: CommonSuccessCode.APIRequestSuccess 
            })
            next()
        }catch(e:any)
        {
            res.send({
                message: e.message,
                code: e.code
            })
        }
    }
    
    static UserAPITest(req :Request, res: Response, next: NextFunction)
    {
        res.send({
            message: "User API test success",
            code: CommonSuccessCode.APIRequestSuccess
        })
        
        next()
    }
}