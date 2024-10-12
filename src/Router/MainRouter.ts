import express, { Router } from "express"
import { UserController } from "../Controllers/UserController"

const userRouter = express.Router()

//User
userRouter.post('/user-login', UserController.UserLogin)
userRouter.post('/user-register', UserController.UserRegister)
userRouter.get('/user-api-test', UserController.UserAPITest)

export function MainRouter(): Router
{
    return userRouter
}

// export function UserAuth()
// {
//     console.log("User authenticated - TODO")
// }

