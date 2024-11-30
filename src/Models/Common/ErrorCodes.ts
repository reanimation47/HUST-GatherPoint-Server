export enum APIErrorCode
{
    UserRegisterRequest_MissingUsernameOrPassword = 401,
    UserRegisterRequest_UserAlreadyExist = 402,
    UserRegisterRequest_FailedToInsertNewUserData = 403,
    
    UserLoginRequest_MissingUsernameOrPassword = 404,
    UserLoginRequest_UsernameOrPasswordIsIncorrect = 405,
    UserLoginRequest_CannotUpdateUserAuthToken = 406,
}

export enum NetworkErrorCode
{
    CannotReachBackendServer = 444
}

export enum CommonErrorCode
{
    CannotHashPassword = 410,
    ENV_DATABASE_URL_MISSING = 411,
    
    GoogleMapsApiFailed = 412,
    
    RequestedUserDoesNotExist = 413,
    
    UserIsNotAuthenticated = 414,
    
    AddFriendsFailed = 415,
    CannotGetFriendList = 416,
    
    CannotGetFriendAddress_Unknown = 417,
    CannotGetFriendAddress_YouAreNotFriendWithUser = 418
}

export enum CommonSuccessCode
{
    APIRequestSuccess = 200
}