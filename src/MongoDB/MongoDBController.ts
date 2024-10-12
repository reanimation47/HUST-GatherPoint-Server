import * as mongoDB from "mongodb";
export class MongoDBController
{
    private db_url: string = "mongodb://localhost:27017"//TODO:hide this
    
    private db_client: mongoDB.MongoClient
    private async connectDB()
    {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(this.db_url)
        try {
            await client.connect()
            console.log("DB client connected")
            
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ping:1})
            console.log("DB client pinged")
            
        }finally{
            // Ensures that the client will close when you finish/error
            await client.close()
        }
    }
    
    async InitDB()
    {
        this.connectDB().catch(console.dir)
    }
    
    
}
