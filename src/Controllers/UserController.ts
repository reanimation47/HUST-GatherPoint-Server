import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { UserLoginRequestModel, UserRegisterRequestModel } from '../Models/API_Requests/API_Request_Models';
import { APIErrorCode } from '../Models/API_Requests/API_Request_ErrorCodes';
import { APIRequestHandler } from '../Utils/API_Request_Handler';
import { MongoDBController } from '../MongoDB/MongoDBController';
import { DB_UserModel, DB_UserType } from '../Models/Database/DB_UserModel';
import { DB_TableName } from '../Configurations/Conf_MongoDB';
import { PasswordHandler } from '../Utils/User_Password_Handler';

type UserID = Pick<DB_UserModel, "username">

export class UserController
{
    static async UserLogin(req :Request, res: Response, next: NextFunction)
    {
        let loginReq = req.body as UserLoginRequestModel
        res.send({
            message: "User login API test success!!",
            provided_username: loginReq.username,
            provided_password: loginReq.password,//for testing
            code: 200
        })
        next()
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
            
            const db_client = MongoDBController.Instance().client
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
                hashed_password: await PasswordHandler.HashPassword(registerReq.password), //TODO: hash this
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
                provided_username: registerReq.username,
                provided_password: registerReq.password,//for testing
                target_user: targetUser,
                code: 200
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
            code: 200
        })
        
        next()
    }
}