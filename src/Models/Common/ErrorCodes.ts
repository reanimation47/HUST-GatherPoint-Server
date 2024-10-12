export enum APIErrorCode
{
    UserRegisterRequest_MissingUsernameOrPassword = 401,
    UserRegisterRequest_UserAlreadyExist = 402,
    UserRegisterRequest_FailedToInsertNewUserData = 403,
    
    UserLoginRequest_MissingUsernameOrPassword = 404,
    UserLoginRequest_UsernameOrPasswordIsIncorrect = 405,
}

export enum CommonErrorCode
{
    CannotHashPassword = 410
}

export enum CommonSuccessCode
{
    APIRequestSuccess = 200
}