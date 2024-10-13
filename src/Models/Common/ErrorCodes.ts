export enum APIErrorCode
{
    UserRegisterRequest_MissingUsernameOrPassword = 401,
    UserRegisterRequest_UserAlreadyExist = 402,
    UserRegisterRequest_FailedToInsertNewUserData = 403,
    
    UserLoginRequest_MissingUsernameOrPassword = 404,
    UserLoginRequest_UsernameOrPasswordIsIncorrect = 405,
    UserLoginRequest_CannotUpdateUserAuthToken = 406,
}

export enum CommonErrorCode
{
    CannotHashPassword = 410,
    ENV_DATABASE_URL_MISSING = 411,
}

export enum CommonSuccessCode
{
    APIRequestSuccess = 200
}