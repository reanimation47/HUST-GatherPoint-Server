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
    Init()
    {
        this.client = new Client()
    }
    
}