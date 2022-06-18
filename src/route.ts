import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
import { errorHandler, signProcessErrorHandler } from './middleware/mw-error';
import { signProcessMW, checkCertificateAlreadyExist } from './middleware/mw-validation';
import { checkId, checkIfApplicant } from './middleware/mw-async-db';
import { JWT_AUTH_MW } from './middleware/mw-auth-JWT';
import { readRepository } from './database/Models/readRepository';


const controller = new UserController();

// router used to manager express routes
const router = Express.Router();
router.use(JWT_AUTH_MW)

router.get('/', (req, res) => {
    res.send('Hello pippo');
});

var repo:readRepository = readRepository.getRepo();

router.get('/test', errorHandler, (req: Request, res: Response) => {
    repo.getSignProcessStatus(1).then((result) => {
        res.send(result)
    })
} )

/**
 * Rotta che permette all'utente di creare un nuovo certificato prelevando i valori dal token JWT */ 
router.get('/create', checkCertificateAlreadyExist, errorHandler, (req:any, res:any) => {
    controller.createCertificate(req, res);
});

/**
 * Rotta che serve per gestire le richieste per il recupero del credito di un utente
 */
router.get('/credit', (req:any, res:any) => {
    controller.getUserToken(req, res);
});

router.get('/file/sign/status/:id', checkId, checkIfApplicant, errorHandler, (req:any, res:any) => {
    controller.getSignProcessStatus(req, res);
});

/**
 * Rotta che serve per gestire le richiesta per invalidare un certificato associato a un utente 
 */
router.get('/invalidate')

router.post('/file/sign/start',signProcessMW, signProcessErrorHandler, (req:any, res:any) => {
    controller.startSignProcess(req, res);
});




export default router