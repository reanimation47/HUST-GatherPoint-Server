import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_Collection, DB_TableName } from '../Configurations/Conf_MongoDB';
import { DB_UserModel } from '../Models/Database/DB_UserModel';

export class MiddlewareController
{
    async Middleware(req :Request, res: Response, next: NextFunction)
    {
        console.log("====================")
        console.log("request received!")
        console.log(req.url)
        this.AuthenticateUser(req, res, next)
        next();
    }
    async AuthenticateUser(req :Request, res: Response, next: NextFunction)
    {
        const username = req.header("RequestFromUser")
        const auth_token = req.header("AuthToken")
        if (!username || !auth_token)
        {
            //TODO: authentication failed
            return
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
    }
}