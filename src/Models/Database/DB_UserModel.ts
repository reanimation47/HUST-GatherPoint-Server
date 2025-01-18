export interface DB_UserModel
{
    username: string
    hashed_password: string
    user_type: DB_UserType
    
    authentication?: DB_User_Authentication
    
    locations: DB_User_Locations
    
    socials: DB_User_Socials
    
}

export enum DB_UserType
{
    User = "User",
    Admin = "Admin"
}

interface DB_User_Authentication
{
    accessToken: string,
    expireTime: string
}

interface DB_User_SearchHistory
{
    //TODO
}

export class DB_User_Locations
{
    constructor(user_addr: string, place_id:string)
    {
        this.my_address = user_addr
        this.my_address_place_id = place_id 
    }
    search_history?: DB_User_SearchHistory
    my_address: string
    my_address_place_id: string
    saved_locations: DB_User_Saved_Locations  = {locations:[]}
    shared_with_me_locations: DB_User_SharedWithUser_Locations = {locations:[]}
}

interface DB_User_Saved_Locations
{
    locations: LocationInfo[]
}

interface DB_User_SharedWithUser_Locations
{
    locations: LocationInfo[]
}

export interface LocationInfo
{
    lat:number
    lng:number

    place_id: string
    
    name: string,
    rating: string //?
    vicinity: string
    
    added_date: string
    shared_by?: string
}

export class DB_User_Socials
{
    friends: string[] = []
    friend_requests_sent: string[] = []
    friend_requests_received: string[] = []
}
