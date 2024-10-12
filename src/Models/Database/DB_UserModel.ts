export enum DB_UserType
{
    User = "User",
    Admin = "Admin"
}

interface DB_User_SearchHistory
{
    //TODO
}
interface DB_User_Saved_Locations
{
    //TODO
}

export interface DB_UserModel
{
    username: string
    hashed_password: string
    user_type: DB_UserType
    
    search_history?: DB_User_SearchHistory
    saved_locations?: DB_User_Saved_Locations 
}



