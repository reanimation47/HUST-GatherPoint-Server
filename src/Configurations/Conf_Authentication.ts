export class AuthTokenConf
{
    static AuthToken_Duration_Hours = 1
    static AuthToken_BytesCount = 64
}

export class AuthAPIConf
{
    static get MongoDB_URL()
    {
        return process.env.MONGODB_URL
    }
    
    static get GoogleMap_API_KEY()
    {
        return process.env.GOOGLEMAP_APIKEY
    }
}