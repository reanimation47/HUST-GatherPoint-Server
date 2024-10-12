export enum APIErrorCode
{
    UserRegisterRequest_MissingUsernameOrPassword = 401,
    UserRegisterRequest_UserAlreadyExist = 402,
    UserRegisterRequest_FailedToInsertNewUserData = 403,
}