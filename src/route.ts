import { UserController } from './controllers/UserController';
import Express from 'express';
import { AdminController } from './controllers/AdminController';
import * as chain from './middleware/middleware-chain'

const controller = new UserController();
const adminController = new AdminController();

// router used to manager express routes
const router = Express.Router();

//middleware generali che vengono richiamate per il token jwt
router.use(chain.JWT_AUTH_MW)

router.get('/', (req, res) => {
    res.send('Benvenuto nel sistema di firma Sopranzetti-Tiseni ver 1.0');
});

/**
 * Rotta che permette all'utente di creare un nuovo certificato prelevando i valori dal token JWT */ 
router.get('/create', chain.CERT_CREATION_MW, (req:any, res:any) => {
    controller.createCertificate(req, res);
});

router.get('/invalidate', chain.CERT_INVALIDATION_MW, (req: any, res: any) => {
    controller.invalidateCertificate(req, res)
} )

/**
 * Rotta che serve per gestire le richieste per il recupero del credito di un utente
 */
router.get('/credit', chain.ERR_HANDL_MW, (req:any, res:any) => {
    controller.getUserToken(req, res);
});

router.get('/download/:id', chain.DOWNLOAD_DOC_MW, (req:any, res:any) => {
    controller.getSignedDocument(req, res);
});

//ADMIN route
router.post('/admin/refill', chain.ADMIN_MW, (req: any, res: any) => {
    adminController.refillUserToken(req, res)
});

export default router