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
}

export interface Get_AutoComplete_Predictions_Model
{
    input: string
}

export interface Social_AddFriend_Request_Model
{
    username: string
}