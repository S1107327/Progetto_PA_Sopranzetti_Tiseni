import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
import { errorHandler, signProcessErrorHandler } from './middleware/mw-error';
import { signProcessMW } from './middleware/mw-validation';
import { checkHeaderId, checkIfApplicant } from './middleware/mw-async-db';
import { JWT_AUTH_MW } from './middleware/mw-auth-JWT';
import { readRepository } from './database/Models/readRepository';

const controller = new UserController();

// router used to manager express routes
const router = Express.Router();
router.use(JWT_AUTH_MW)

router.get('/', (req, res) => {
    res.send('Hello pippo');
});

var repo:readRepository = new readRepository();

router.get('/test', errorHandler, (req: Request, res: Response) => {
    repo.getSignProcessStatus(1).then((result) => {
        res.send(result)
    })
} )

/**
 * Rotta che serve per gestire le richieste per il recupero del credito di un utente
 */
router.get('/user/credit', controller.getUserToken)

/**
 * Rotta che serve per gestire le richiesta per invalidare un certificato associato a un utente 
 */
router.get('/cert/invalidate')


router.post('/file',controller.createCertificate);

router.post('/file/sign/start',signProcessMW, signProcessErrorHandler, controller.startSignProcess)

router.get('/file/sign/status', checkHeaderId, checkIfApplicant, errorHandler, controller.getSignProcessStatus )


export default router