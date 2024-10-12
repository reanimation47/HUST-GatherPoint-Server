export class APIRequestHandler
{
    static IsParamValid(param: any)
    {
        return param != null && param != undefined && param != "" && param
    }
    
    static AreParamsValid(...params: any[])
    {
        for (let i = 0; i < params.length; i++)
        {
            if (!APIRequestHandler.IsParamValid(params[i]))
            {
                return false
            }
        }
        // params.forEach((param: any) => { //NOTE: return inside a foreach does not breakout the whole function
        // })
        
        return true
    }
}