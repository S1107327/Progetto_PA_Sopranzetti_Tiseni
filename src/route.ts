import { UserController } from './controllers/UserController';
import Express, { Request, Response } from 'express';
const router = Express.Router();

const controller = new UserController();

router.get('/', (req, res) => {
    res.send('Hello pippo');
});

router.post('/file', controller.createCertificate);

/*router.get('/test', (req: Request, res: Response) => {
    repo.test().then((result) => {
        res.send(result)
    })
} )*/
export default router