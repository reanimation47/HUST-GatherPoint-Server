import * as mongoDB from "mongodb";
export class MongoDBClient//Singleton class
{
    private static instance: MongoDBClient
    private constructor() {}
    static Instance() 
    {
        if (this.instance) 
        {
            return this.instance;
        }
        this.instance = new MongoDBClient();
        return this.instance;
    }
    
    private db_url: string = "mongodb://localhost:27017"//TODO:hide this
    
    private db_client: mongoDB.MongoClient
    get client(): mongoDB.MongoClient {return this.db_client}
    private async connectDB()
    {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(this.db_url)
        try {
            
            await client.connect()
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ping:1})
            this.db_client = client
            // console.log("MongoDB client connected")
            
            
        }finally{
            // Ensures that the client will close when you finish/error
            // await client.close()
        }
    }
    
    async EstablishDBConnection()
    {
        await this.connectDB().catch(console.dir)
    }
    
    IsConnected() :boolean
    {
        return this.db_client != undefined
    }
    
    
}
