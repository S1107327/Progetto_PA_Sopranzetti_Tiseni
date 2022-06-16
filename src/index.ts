import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import router from "./route";
import { checkHeader, checkToken, verifyAndAuthenticate, checkUserAuthJWT } from './middleware/mw-auth-JWT';

// App
const app = express();

// Righe aggiunte per accettare richieste da un client come postman
app.use(bodyParser.json()); 
app.use((req, res, next) => {    
    res.setHeader('Access-Control-Allow-Origin', '*');    
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');    
    next();
});

app.use([checkHeader, checkToken, verifyAndAuthenticate,checkUserAuthJWT])
app.use('/', router);


app.listen(config.PORT);
console.log(`Running on http://${config.HOST}:${config.PORT}`);