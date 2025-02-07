import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
// import {cors} from 'cors'
const cors = require('cors');

import { MainRouter } from './Router/MainRouter';
import { MongoDBClient } from './ExternalServiceClients/MongoDBClient';
import { GoogleMapClient } from './ExternalServiceClients/GoogleMapClient';
import { MiddlewareController } from './Controllers/MiddlewareController';

//For env File 
dotenv.config();

async function main()
{
    //Establish connection with MongoDB 
    // const mongoDBcontroller = new MongoDBController()
    console.log("Trying to connect to MongoDB")
    await MongoDBClient.Instance().EstablishDBConnection()
    console.log("Established connection to mongoDB")
    
    
    //Init GoogleMapsAPI Client
    GoogleMapClient.Instance().Init()
    
    //Start listening to requests
    const app: Application = express();
    const port = process.env.PORT || 8000;
    
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    
    //Middleware
    const middlewareControll = new MiddlewareController()
    app.use(function (req, res, next) {
        middlewareControll.Middleware(req, res, next)
    });
    app.use(MainRouter())
    app.get('/', (req: Request, res: Response) => {
      res.send('Welcome to Express & TypeScript Server OKY');
    });
    // app.post('/user-login', (req: Request, res: Response) => {
    //     console.log(req.body)
    //   res.send();
    // });
    
    
    // app.get('/user-login', (req: Request, res: Response) => {
    //     res.send('Login api called');
    // });
    
    app.listen(port, () => {
      console.log(`Server is online at http://localhost:${port}`);
    });
}

main().catch(console.dir)

