import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
import { checkHeader } from './middleware/auth-JWT';
import { errorHandler } from './middleware/middleware-error';
import { repository } from './database/Models/repository';
const router = Express.Router();

const controller = new UserController();

router.get('/', (req, res) => {
    res.send('Hello pippo');
});

var repo = new repository();

router.get('/test', checkHeader, errorHandler, (req: Request, res: Response) => {
    repo.test().then((result) => {
        res.send(result)
    })
} )


router.post('/file', controller.createCertificate);

/*router.get('/test', (req: Request, res: Response) => {
    repo.test().then((result) => {
        res.send(result)
    })
} )*/
export default router