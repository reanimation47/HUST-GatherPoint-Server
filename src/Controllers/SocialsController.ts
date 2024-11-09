import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { Social_AddFriend_Request_Model } from '../Models/API_Requests/API_Request_Models';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_Collection, DB_TableName } from '../Configurations/Conf_MongoDB';
import { DB_UserModel } from '../Models/Database/DB_UserModel';
import { CommonErrorCode, CommonSuccessCode } from '../Models/Common/ErrorCodes';

export class SocialsController
{
    async AddFriend(req :Request, res: Response, next: NextFunction)
    {
        try{
            
            let req_username = (req.body as Social_AddFriend_Request_Model).username
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            
            //Check if user exists
            const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
            const targetUser = await collection.findOne(
                {username: req_username}
            )
            
            if(targetUser == null)
            {
                throw {
                    message: "User does not exist!",
                    code: CommonErrorCode.RequestedUserDoesNotExist
                }
            }
            
            res.send({
                message: "Friend Request Sucess",
                code: CommonSuccessCode.APIRequestSuccess
            })
            
        } catch (e:any){
            res.send({
                message: e.message,
                code: e.code 
            })
        }
    }
}