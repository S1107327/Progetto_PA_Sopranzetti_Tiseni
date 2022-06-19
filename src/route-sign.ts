import { UserController } from './controllers/UserController';
import Express from 'express';
import * as chain from './middleware/middleware-chain'

const controller = new UserController();
const signRouter = Express.Router();

signRouter.use(chain.JWT_AUTH_MW)

signRouter.get('/getchallnumbers', chain.ERR_HANDL_MW, (req: any, res: any) => {
    controller.getChallengingNumbers(req, res);
});

signRouter.get('/status/:id', chain.PROC_STATUS_MW, (req:any, res:any) => {
    controller.getSignProcessStatus(req, res);
});

signRouter.post('/start',chain.SIGN_PROCESS_MW, (req:any, res:any) => {
    controller.startSignProcess(req, res);
});

signRouter.get('/cancel/:id', chain.CANC_PROCESS_MW, (req: any, res: any) => {
    controller.cancelSignProcess(req, res)
});

signRouter.post('/:id', chain.SIGN_DOCUMENT_MW,(req:any, res:any) => {
    controller.signDocument(req, res);
});

export default signRouter;