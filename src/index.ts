import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import router from "./route";
import { appErrorHandler } from './middleware/mw-error';

// App
const app = express();

// Righe aggiunte per accettare richieste da un client come postman
app.use(bodyParser.json()); 

//gestisce il caso di payload malformattato
app.use(appErrorHandler)

app.use((req, res, next) => {    
    res.setHeader('Access-Control-Allow-Origin', '*');    
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');    
    next();
});

app.use('/', router);


app.listen(config.PORT);
console.log(`Running on http://${config.HOST}:${config.PORT}`);