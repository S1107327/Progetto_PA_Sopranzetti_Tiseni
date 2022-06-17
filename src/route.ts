import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
import { errorHandler, signProcessErrorHandler } from './middleware/mw-error';
import { repository } from './database/Models/repository';
import { signProcessMW } from './middleware/mw-validation';
import { checkForm_Data, CriticalsAsyncMW } from './middleware/mw-async-db';
import { checkHeader, checkToken, verifyAndAuthenticate } from './middleware/mw-auth-JWT';
import { upload } from './utils/multer-config';
import { JWT_AUTH_MW } from './middleware/mw-auth-JWT';

const controller = new UserController();

// router used to manager express routes
const router = Express.Router();
router.use(JWT_AUTH_MW)




router.get('/', (req, res) => {
    res.send('Hello pippo');
});

var repo = new repository();

router.get('/test', errorHandler, (req: Request, res: Response) => {
    repo.test().then((result) => {
        res.send(result)
    })
} )

/**
 * Rotta che serve per gestire le richieste per il recupero del credito di un utente
 */
router.get('/user/credit', CriticalsAsyncMW, (req: Request, res: Response) => {
    //TODO: inserire la funzione del controller che recupera il credito dal model
})

/**
 * Rotta che serve per gestire le richiesta per invalidare un certificato associato a un utente 
 */
router.get('/cert/invalidate', CriticalsAsyncMW)


router.post('/file', CriticalsAsyncMW, controller.createCertificate);

router.post('/file/sign/start', signProcessMW, signProcessErrorHandler, controller.startSignProcess)


export default router