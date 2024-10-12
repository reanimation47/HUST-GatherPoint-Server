import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { UserLoginRequestModel, UserRegisterRequestModel } from '../Models/API_Requests/API_Request_Models';
import { APIErrorCode } from '../Models/API_Requests/API_Request_ErrorCodes';
import { APIRequestHandler } from '../Utils/API_Request_Handler';

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
    
    static UserRegister(req :Request, res: Response, next: NextFunction)
    {
        try {
            let registerReq = req.body as UserRegisterRequestModel 
            if(!APIRequestHandler.AreParamsValid(registerReq.password, registerReq.username))
            {
                throw new Error("please provide username AND passowrd")
            }
            
            
            res.send({
                message: "User registeration success",
                provided_username: registerReq.username,
                provided_password: registerReq.password,//for testing
                code: 200
            })
            next()
        }catch(e:any)
        {
            res.send({
                message: "User registeration failed",
                error: e.message,
                code: APIErrorCode.UserRegisterRequestMissingUsernameOrPassword
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