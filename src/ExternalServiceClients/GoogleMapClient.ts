import {Client} from "@googlemaps/google-maps-services-js";
export class GoogleMapClient
{
    private static instance: GoogleMapClient
    private constructor() {}
    static Instance() 
    {
        if (this.instance) 
        {
            return this.instance;
        }
        this.instance = new GoogleMapClient();
        return this.instance;
    }
    
    client: Client 
    private maps_api_key:string | null
    Init()
    {
        if (!process.env.GOOGLEMAP_APIKEY) 
        {
            throw Error("api secret for Google Maps is not provided or cannot be loaded.")
        }
        this.client = new Client()
        this.maps_api_key = process.env.GOOGLEMAP_APIKEY ?? null
    }
    
    Client()
    {
        return this.client
    }
    
    get private_key()
    {
        return this.maps_api_key
    }
    
    
    
}