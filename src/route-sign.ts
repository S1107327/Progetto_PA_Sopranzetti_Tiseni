import Express from 'express';
import * as chain from './middleware/middleware-chain'
import { SignController } from './controllers/SignController';

const controller = new SignController();
const signRouter = Express.Router();

/**
 * Rotta che fornisce le funzionalità per ottenere i chellenging numbers
 */
signRouter.get('/getchallnumbers', chain.JWT_AUTH_MW, chain.ERR_HANDL_MW, (req: any, res: any) => {
    controller.getChallengingNumbers(req, res);
});

/**
 * Rotta che consente di ottenere lo stato del processo di firma di un particolare documento
 * indicandone l'id nella rotta
 */
signRouter.get('/status/:id', chain.JWT_AUTH_MW, chain.PROC_STATUS_MW, (req:any, res:any) => {
    controller.getSignProcessStatus(req, res);
});

/**
 * Rotta che consente di iniziare un nuovo processo di firma
 */
signRouter.post('/start', chain.JWT_AUTH_MW, chain.SIGN_PROCESS_MW, (req:any, res:any) => {
    controller.startSignProcess(req, res);
});

/**
 * Rotta che consente di cancellare un particolare processo di firma indicando l'id del documento
 * del quale se ne vuole cancellare il processo 
 */
signRouter.get('/cancel/:id', chain.JWT_AUTH_MW, chain.CANC_PROCESS_MW, (req: any, res: any) => {
    controller.cancelSignProcess(req, res)
});

/**
 * Rotta che consente di firmare un determinato documento indicandone l'id nel
 */
signRouter.post('/:id', chain.JWT_AUTH_MW, chain.SIGN_DOCUMENT_MW,(req:any, res:any) => {
    controller.signDocument(req, res);
});

export default signRouter;