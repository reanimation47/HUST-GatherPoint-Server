import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';

import { MainRouter } from './Router/MainRouter';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(function (req, res, next) {
    console.log("Middleware called??");
    next();
});
app.use(MainRouter())//?


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server OKY');
});


// app.get('/user-login', (req: Request, res: Response) => {
//     res.send('Login api called');
// });

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});