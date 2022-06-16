import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
import { errorHandler, signProcessErrorHandler } from './middleware/mw-error';
import { repository } from './database/Models/repository';
import { signProcessMW } from './middleware/mw-validation';
import { CriticalsAsyncMW } from './middleware/mw-async-db';

const router = Express.Router();
const controller = new UserController();

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

router.post('/file/sign/start', CriticalsAsyncMW, signProcessMW, signProcessErrorHandler, controller.startSignProcess)


export default router