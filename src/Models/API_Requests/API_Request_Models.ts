import type { LocationInfo } from "../Database/DB_UserModel"

export interface UserLoginRequestModel
{
    username: string,
    password: string
}

export interface UserRegisterRequestModel
{
    username: string
    password: string
    address: string
    address_place_id: string
}

export interface UserSharePlaceWithFriendsRequestModel
{
    place: LocationInfo
    friends: string[] //list of usernames
}

export interface Get_AutoComplete_Predictions_Model
{
    input: string
}

export interface Get_Best_Locations_Request_Model
{
    place_ids: string[]
    options: any
}

export interface Social_AddFriend_Request_Model
{
    username: string
}

export interface Social_RemoveFriend_Request_Model
{
    username: string
}
export interface Social_GetFriendAddr_Request_Model
{
    username: string
}
