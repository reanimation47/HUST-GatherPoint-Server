import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { UserLoginRequestModel } from '../Models/API_Request_Models';

export class UserController
{
    static async UserLogin(req :Request, res: Response, next: NextFunction)
    {
        let loginReq = req.body as UserLoginRequestModel
        console.log(req.body)
        res.send({
            message: "User login API test success!!",
            provided_username: loginReq.username,
            provided_password: loginReq.password,//for testing
            code: 200
        })
        next()
    }
    
    static UserRegister()
    {
        console.log("User register")
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