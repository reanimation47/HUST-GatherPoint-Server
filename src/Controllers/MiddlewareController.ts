import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_Collection, DB_TableName } from '../Configurations/Conf_MongoDB';
import { DB_UserModel } from '../Models/Database/DB_UserModel';
import { CommonErrorCode, CommonSuccessCode } from '../Models/Common/ErrorCodes';
import { API_URL } from '../Models/API_Requests/API_Request_URLs';

export class MiddlewareController
{
    static header_from_user = "RequestFromUser"
    static header_auth_token= "AuthToken"
    
    async Middleware(req :Request, res: Response, next: NextFunction)
    {
        console.log("====================")
        console.log("request received!")
        console.log(req.url)
        await this.AuthenticateUser(req, res, next)
    }
    async AuthenticateUser(req :Request, res: Response, next: NextFunction)
    {
        try{
            const no_auth_required_requests: string[] =[API_URL.UserLogin, API_URL.UserRegister, API_URL.Maps_GetAutoComplete_Predictions]
            if (no_auth_required_requests.includes(req.url)) 
            {
                next()
                return
            }
            
            
            const username = req.header(MiddlewareController.header_from_user)
            const auth_token = req.header(MiddlewareController.header_auth_token)
            if (!username || !auth_token)
            {
                //TODO: authentication failed
                throw new Error()
            }
            
            console.log(`Request from user: ${username}`)
            console.log(`AuthToken: ${auth_token}`)
            
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            
            //Check if user exists
            const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
            const targetUser = await collection.findOne(
                {
                    username: username,
                }
            )
            
            //Username not registered
            if (targetUser == null)
            {
                throw new Error("User not registered")
            }
            
            //Username exists but have never logged in
            if (!targetUser.authentication)
            {
                throw new Error("Username exists but have never logged in")
            }
            
            //Username exists but have never logged in
            if (!targetUser.authentication.accessToken)
            {
                throw new Error("Username exists but have never logged in")
            }
            
            //Incorrect auth token
            if (targetUser.authentication.accessToken != auth_token)
            {
                throw new Error("Incorrect auth token")
            }
            
            if (targetUser.authentication.expireTime)
            {
                const expireTime = new Date(targetUser.authentication.expireTime)
                const now = new Date()
                if (expireTime.getTime() - now.getTime() <= 0)
                {
                    throw new Error("User's access token has expired")
                }
            }
            next()
            
            
            
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "User is not authenticated to do this action",
                code: CommonErrorCode.UserIsNotAuthenticated
            })
        }

    }
}