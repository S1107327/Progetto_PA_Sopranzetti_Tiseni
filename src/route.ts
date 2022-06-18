import { UserController } from './controllers/UserController';
import Express from 'express';
import { errorHandler, signProcessErrorHandler } from './middleware/mw-error';
import { checkCertificateAlreadyExist } from './middleware/mw-validation';
import { checkId, checkIfApplicant, checkIfCompleted, signProcessMW } from './middleware/mw-async-db';
import { JWT_AUTH_MW } from './middleware/mw-auth-JWT';

const controller = new UserController();

// router used to manager express routes
const router = Express.Router();
router.use(JWT_AUTH_MW)

router.get('/', (req, res) => {
    res.send('Hello pippo');
});

/*var repo:readRepository = readRepository.getRepo();

router.get('/test', errorHandler, (req: Request, res: Response) => {
    repo.getSignProcessStatus(1).then((result) => {
        res.send(result)
    })
} )*/

/**
 * Rotta che permette all'utente di creare un nuovo certificato prelevando i valori dal token JWT */ 
router.get('/create', checkCertificateAlreadyExist, errorHandler, (req:any, res:any) => {
    controller.createCertificate(req, res);
});

router.get('/sign/getchallnumbers', errorHandler, (req: any, res: any) => {
    controller.getChallengingNumbers(req, res);
});

/**
 * Rotta che serve per gestire le richieste per il recupero del credito di un utente
 */
router.get('/credit', (req:any, res:any) => {
    controller.getUserToken(req, res);
});

router.get('/sign/status/:id', checkId, checkIfApplicant, errorHandler, (req:any, res:any) => {
    controller.getSignProcessStatus(req, res);
});

/**
 * Rotta che serve per gestire le richiesta per invalidare un certificato associato a un utente 
 */
router.get('/invalidate')

router.post('/sign', (req:any, res:any) => {
    controller.signDocument(req, res);
});

router.post('/sign/start',signProcessMW, signProcessErrorHandler, (req:any, res:any) => {
    controller.startSignProcess(req, res);
});

router.get('/sign/cancel/:id', checkId, checkIfApplicant, checkIfCompleted, errorHandler, (req: any, res: any) => {
    controller.cancelSignProcess(req, res)
})

export default router