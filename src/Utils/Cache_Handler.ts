import { MongoDBClient } from "../ExternalServiceClients/MongoDBClient";

interface Request_Cache_Model
{
    request_type: string,
    request_input: string,
    request_cached_output: any
}


export class CacheHandler
{
    static cache_DB_name = "CacheDB"
    static collection_requestCache = "RequestCache"
    static async Check_Request_Cache(req_type: string, req_input: string)
    {
        try{
            const DBClient = MongoDBClient.Instance().client
            const db = DBClient.db(CacheHandler.cache_DB_name)
            const collection = db.collection<Request_Cache_Model>(CacheHandler.collection_requestCache)
            
            const targetCache = await collection.findOne({
                request_type: req_type,
                request_input: req_input
            })
            
            if (targetCache != null)
            {
                return Promise.resolve({
                    cachedData: targetCache.request_cached_output as any
                })
            }else
            {
                return Promise.resolve({
                    cachedData: null 
                })
            }
        }catch(e:any)
        {
            return Promise.reject({
                cachedData: null 
            })
        }
    }
    
    static async Set_Request_Cache(req_type: string, req_input: string, req_output: string)
    {
        try{
            const DBClient = MongoDBClient.Instance().client
            const db = DBClient.db(CacheHandler.cache_DB_name)
            const collection = db.collection<Request_Cache_Model>(CacheHandler.collection_requestCache)
            
            const insertResult = await collection.insertOne({
                request_type: req_type,
                request_input: req_input,
                request_cached_output: req_output
            })
            
            if (insertResult.acknowledged)
            {
                return Promise.resolve()
            }else
            {
                return Promise.reject()
            }
        }catch(e:any)
        {
            return Promise.reject()
        }
    }
}