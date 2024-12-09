import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { Social_AddFriend_Request_Model, Social_GetFriendAddr_Request_Model } from '../Models/API_Requests/API_Request_Models';
import { MongoDBClient } from '../ExternalServiceClients/MongoDBClient';
import { DB_Collection, DB_TableName } from '../Configurations/Conf_MongoDB';
import { DB_UserModel } from '../Models/Database/DB_UserModel';
import { CommonErrorCode, CommonSuccessCode } from '../Models/Common/ErrorCodes';
import { MiddlewareController } from './MiddlewareController';
import { Get_Friend_Address_Response_Model } from '../Models/API_Responses/API_Response_Models';

export class SocialsController
{
    async AddFriend(req :Request, res: Response, next: NextFunction)
    {
        try{
            let from_username = req.header(MiddlewareController.header_from_user)
            
            let to_username = (req.body as Social_AddFriend_Request_Model).username
            const db_client = MongoDBClient.Instance().client
            const db = db_client.db(DB_TableName.UserData)
            
            //Check if user exists
            const collection = db.collection<DB_UserModel>(DB_Collection.UserData)
            const targetUser = await collection.findOne(
                {username: to_username}
            )
            
            if(targetUser == null)
            {
                throw {
                    message: "User does not exist!",
                    code: CommonErrorCode.RequestedUserDoesNotExist
                }
            }
            
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
            
            if(from_username == to_username)
            {
                throw {
                    message: "You cannot send a request to yourself..",
                    code: CommonErrorCode.AddFriendsFailed
                }
            }
            
            if (fromUser.socials.friend_requests_sent.includes(to_username))
            {
                throw {
                    message: "You have already sent a request to this user",
                    code: CommonErrorCode.AddFriendsFailed
                }
            }
            
            if (fromUser.socials.friends.includes(to_username))
            {
                throw {
                    message: "You are already friend with this user",
                    code: CommonErrorCode.AddFriendsFailed
                }
            }
            
            
            //If target user has also sent a friend request -> Both become friends
            if (targetUser.socials.friend_requests_sent.includes(from_username?? "username shouldn't be empty.."))
            {
                const updateResult1 = await collection.updateOne(
                    {
                        username: from_username
                    }, 
                    {
                        $push: {
                            "socials.friends" : to_username
                        },
                        $pull: {
                            "socials.friend_requests_sent": to_username //Redundant for now
                        }
                    }
                )
                if (!updateResult1.acknowledged) {throw new Error()}
                
                const updateResult2 = await collection.updateOne(
                    {
                        username: to_username
                    }, 
                    {
                        $push: {
                            "socials.friends" : from_username
                        },
                        $pull: {
                            "socials.friend_requests_sent": from_username
                        }
                        
                    }
                )
                if (!updateResult2.acknowledged) {throw new Error()}
                
                res.send({
                    message: `You are now friend with ${to_username}`,
                    code: CommonSuccessCode.APIRequestSuccess
                })
                next()
                return
            }
            
            //Normal case, just send a friend request to target user
            const updateResult = await collection.updateOne(
                {
                    username: from_username
                }, 
                {
                    $push: {
                        "socials.friend_requests_sent" : to_username
                    }
                }
            )
            if (!updateResult.acknowledged) {throw new Error()}
            
            res.send({
                message: `Friend request sent to ${to_username}`,
                code: CommonSuccessCode.APIRequestSuccess
            })
            
            
            next()
        } catch (e:any){
            if (e.code && e.message)
            {
                res.send({
                    message: e.message,
                    code: e.code 
                })
            }else
            {
                res.send({
                    message: "Add friend operation failed",
                    code: CommonErrorCode.AddFriendsFailed 
                })
            }
        }
    }
    
    async GetFriendsList(req :Request, res: Response, next: NextFunction)
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
            
            let list_friends = fromUser.socials?.friends
            if (!Array.isArray(list_friends))
            {
                list_friends = []
            }
            
            res.send({
                message: `Request Sucess`,
                result: list_friends,
                code: CommonSuccessCode.APIRequestSuccess
            })
            next()
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "Unknown error",
                code: CommonErrorCode.CannotGetFriendList
            })
            
        }
    }
    
    async GetFriendAddress(req :Request, res: Response, next: NextFunction)
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
            
            //Check if from-user is a friend with to-user
            
            //Start with does from-user even has any friend
            let list_friends = fromUser.socials?.friends
            if (!Array.isArray(list_friends))
            {
                throw {
                    message: "You are not friend with target user 1",
                    code: CommonErrorCode.CannotGetFriendAddress_YouAreNotFriendWithUser
                }
            }else
            {
                if (list_friends.length <= 0)
                {
                    throw {
                        message: "You are not friend with target user 2",
                        code: CommonErrorCode.CannotGetFriendAddress_YouAreNotFriendWithUser
                    }
                }
            }
            
            //Okay from-user does have some friends, check if to-user is 1 of his friends
            let to_username = (req.body as Social_GetFriendAddr_Request_Model).username
            if (!list_friends.includes(to_username))
            {
                throw {
                    message: "You are not friend with target user 3",
                    code: CommonErrorCode.CannotGetFriendAddress_YouAreNotFriendWithUser
                }
            }
            
            //Check if user exists
            const toUser = await collection.findOne(
                {username: to_username}
            )
            if(toUser == null)
            {
                //user's friend no longer exist in db?
                throw {
                    message: "Uhm your friend does not exist in DB..?",
                    code: CommonErrorCode.RequestedUserDoesNotExist
                }
            }
            
            const response: Get_Friend_Address_Response_Model = {
                message: "You can have your friend's address :)",
                address: toUser.locations.my_address,
                address_place_id: toUser.locations.my_address_place_id,
                code: CommonSuccessCode.APIRequestSuccess
            }
            res.send(response)
            
            next()
        }catch(e:any)
        {
            res.send({
                message: e.message ?? "Unknown error",
                code: e.code ?? CommonErrorCode.CannotGetFriendAddress_Unknown
            })
            
        }
    }
}