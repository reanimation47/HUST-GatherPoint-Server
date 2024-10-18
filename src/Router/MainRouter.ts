import express, { Router } from "express"
import { UserController } from "../Controllers/UserController"
import { API_URL } from "../Models/API_Requests/API_Request_URLs"

const userRouter = express.Router()

//User
userRouter.post(API_URL.UserLogin, UserController.UserLogin)
userRouter.post(API_URL.UserRegister, UserController.UserRegister)
userRouter.get('/user-api-test', UserController.UserAPITest)

export function MainRouter(): Router
{
    return userRouter
}

// export function UserAuth()
// {
//     console.log("User authenticated - TODO")
// }

