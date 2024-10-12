import express, { Express, Request, Response , Application, NextFunction } from 'express';

export class UserController
{
    static async UserLogin(req :Request, res: Response, next: NextFunction)
    {
        res.send({
            message: "User login API test success",
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