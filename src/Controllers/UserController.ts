import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { UserLoginRequestModel, UserRegisterRequestModel, UserSharePlaceWithFriendsRequestModel } from '../Models/API_Requests/API_Request_Models';
import { APIErrorCode, CommonErrorCode, CommonSuccessCode } from '../Models/Common/ErrorCodes';
import { APIRequestHandler } from '../Utils/API_Request_Handler';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_User_Locations, DB_User_Socials, DB_UserModel, DB_UserType, LocationInfo } from '../Models/Database/DB_UserModel';
import { DB_Collection, DB_TableName } from '../Configurations/Conf_MongoDB';
import { AuthenticationHandler } from '../Utils/User_Authentication_Handler';
import { DateHandler } from '../Utils/Date_Handler';
import { AuthTokenConf } from '../Configurations/Conf_Authentication';
import { MiddlewareController } from './MiddlewareController';

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
                user_type: DB_UserType.User,
                socials: new DB_User_Socials(),
                locations: new DB_User_Locations(registerReq.address, registerReq.address_place_id)
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
    
    static async UserSavePlaceToFavorites(req :Request, res: Response, next: NextFunction)
    {
        UserController.TogglePlaceFromFavorites(req, res, next, true)
    }
    
    static async UserRemovePlaceFromFavorites(req :Request, res: Response, next: NextFunction)
    {
        UserController.TogglePlaceFromFavorites(req, res, next, false)
    }
    
    
    static async TogglePlaceFromFavorites(req :Request, res: Response, next: NextFunction, is_adding: boolean)
    {
        try{
            //TODO: this whole part repeats in AddFriend function -- start
            let from_username = req.header(MiddlewareController.header_from_user)
            
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
            
            //Check if user exists
            const fromUser = await collection.findOne(
                {username: from_username}
            )
            if(fromUser == null)
            {
                //this should not be possible.. Let's just say user is not authenticated.. & redirect them back to Login page'
                throw {
                    message: "Uhm You don't exist in DB..?",
                    code: CommonErrorCode.UserIsNotAuthenticated
                }
            }
            //TODO: this whole part repeats in AddFriend function -- end
            
            let locationData: LocationInfo = req.body.data as LocationInfo
            if (is_adding)
            {
                const updateResult1 = await collection.updateOne(
                    {
                        username: from_username
                    }, 
                    {
                        $push: {
                            "locations.saved_locations.locations" : locationData
                        },
                    }
                )
                if (!updateResult1.acknowledged) {throw new Error()}
            }else
            {
                const updateResult1 = await collection.updateOne(
                    {
                        username: from_username
                    }, 
                    {
                        $pull: {
                            "locations.saved_locations.locations" : {place_id: locationData.place_id}
                        },
                    }
                )
                if (!updateResult1.acknowledged) {throw new Error()}
            }
            res.send({
                message: "Place API succeeded",
                // provided_username: registerReq.username,
                // provided_password: registerReq.password,//for testing
                code: CommonSuccessCode.APIRequestSuccess 
            })

        }catch(e:any)
        {
            
            res.send({
                message: e.message ?? "unknown error",
                code: e.code ?? CommonErrorCode.CannotSavePlaceToFavorite //TODO, need to separate for removing place too
            })
        }
    }
    
    static async UserGetSavedFavoritePlaces(req :Request, res: Response, next: NextFunction)
    {
        try{
            const userData = await UserController.Utils_GetUserDataFromDB(req)
            
            res.send({
                message: "API call success",
                code: CommonSuccessCode.APIRequestSuccess,
                result: userData.locations.saved_locations.locations,
            })
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "unknown error",
                code: e.code ?? CommonErrorCode.CannotGetSavedFavoritePlaces
            })
        }
    }
    
    static async UserGetSharedWithPlaces(req :Request, res: Response, next: NextFunction)
    {
        try{
            const userData = await UserController.Utils_GetUserDataFromDB(req)
            
            res.send({
                message: "API call success",
                code: CommonSuccessCode.APIRequestSuccess,
                result: userData.locations.shared_with_me_locations.locations,
            })
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "unknown error",
                code: e.code ?? CommonErrorCode.CannotGetSavedFavoritePlaces
            })
        }
    }
    
    static async UserRemoveSharedWithPlaces(req :Request, res: Response, next: NextFunction)
    {
        try{
            const userData = await UserController.Utils_GetUserDataFromDB(req)
            
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
            
            let locationData = req.body.data as {place_id:string} 
            const updateResult1 = await collection.updateOne(
                {
                    username: userData.username 
                }, 
                {
                    $pull: {
                        "locations.shared_with_me_locations.locations" : {place_id: locationData.place_id}
                    },
                }
            )
            if (!updateResult1.acknowledged) {throw new Error()}
            
            res.send({
                message: "Place API succeeded",
                // provided_username: registerReq.username,
                // provided_password: registerReq.password,//for testing
                code: CommonSuccessCode.APIRequestSuccess 
            })
            
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "Place API failed",
                // provided_username: registerReq.username,
                // provided_password: registerReq.password,//for testing
                code: e.code ?? CommonErrorCode.CannotRemovePlace
            })
        }
    }
    
    
    static async UserSharePlaceWithFriends(req :Request, res: Response, next: NextFunction)
    {
        try{
            const userData = await UserController.Utils_GetUserDataFromDB(req)
            const share_data = req.body.data as UserSharePlaceWithFriendsRequestModel
            for (let i = 0; i < share_data.friends.length; i ++)
            {
                const friend_username = share_data.friends[i]
                const friendData = await UserController.Utils_GetUserDataFromDB_ByUsername(friend_username)
                const db_client = MongoDBClient.Instance().client
                const db = db_client.db(DB_TableName.UserData)
                const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
                
                
                const locationData: LocationInfo = share_data.place
                locationData.shared_by = userData.username
                if (friendData.locations.shared_with_me_locations.locations.find(location => location.place_id == locationData.place_id))
                {
                    //TODO: This means someone has already shared this place with this friend.. Do we skip it? ..
                }
                const updateResult1 = await collection.updateOne(
                    {
                        username: friend_username
                    }, 
                    {
                        $push: {
                            "locations.shared_with_me_locations.locations" : locationData
                        },
                    }
                )
                if (!updateResult1.acknowledged) {throw new Error()}
                
            }
            
            res.send({
                message: "Place API succeeded",
                // provided_username: registerReq.username,
                // provided_password: registerReq.password,//for testing
                code: CommonSuccessCode.APIRequestSuccess 
            })
            
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "unknown error",
                code: e.code ?? CommonErrorCode.CannotSharePlace
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
    
    static async Utils_GetUserDataFromDB(req :Request)
    {
        //TODO: this whole part repeats in AddFriend function -- start
        let from_username = req.header(MiddlewareController.header_from_user)
        if (from_username == undefined)
        {
            throw {
                code: 0,
                message: "UserController.Utils_GetUserDataFromDB() -> You did not provide a username in Request"
            }
        }
        return await UserController.Utils_GetUserDataFromDB_ByUsername(from_username)
    }
    
    static async Utils_GetUserDataFromDB_ByUsername(username: string)
    {
        //TODO: this whole part repeats in AddFriend function -- start
        let from_username = username 
        
        const db_client = MongoDBClient.Instance().client
        const db = db_client.db(DB_TableName.UserData)
        const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
        
        //Check if user exists
        const fromUser = await collection.findOne(
            {username: from_username}
        )
        if(fromUser == null)
        {
            //this should not be possible.. Let's just say user is not authenticated.. & redirect them back to Login page'
            throw {
                message: "Uhm You don't exist in DB..?",
                code: CommonErrorCode.UserIsNotAuthenticated
            }
        }
        //TODO: this whole part repeats in AddFriend function -- end
        
        return Promise.resolve(fromUser)
    }
}