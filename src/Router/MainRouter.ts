import express, { NextFunction, Router } from "express"
import { UserController } from "../Controllers/UserController"
import { API_URL } from "../Models/API_Requests/API_Request_URLs"
import { LocationsController } from "../Controllers/LocationsController"
import { SocialsController } from "../Controllers/SocialsController"

const userRouter = express.Router()
const locationController = new LocationsController()
const socialController = new SocialsController()

//User
userRouter.post(API_URL.UserLogin, UserController.UserLogin)
userRouter.post(API_URL.UserRegister, UserController.UserRegister)
// userRouter.post(API_URL.Maps_GetAutoComplete_Predictions, (req, res, next) =>  locationController.Get_AutoComplete_Predictions(req, res, next))
userRouter.post(API_URL.Maps_GetAutoComplete_Predictions, locationController.Get_AutoComplete_Predictions)

userRouter.post(API_URL.Socials_AddFriend, socialController.AddFriend)
userRouter.post(API_URL.Socials_GetFriendsList, socialController.GetFriendsList)
userRouter.post(API_URL.Socials_GetFriendAddress, socialController.GetFriendAddress)
userRouter.get('/user-api-test', UserController.UserAPITest)

export function MainRouter(): Router
{
    return userRouter
}

// export function UserAuth()
// {
//     console.log("User authenticated - TODO")
// }

