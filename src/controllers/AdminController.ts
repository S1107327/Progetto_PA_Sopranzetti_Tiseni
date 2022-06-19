import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { Controller } from "./Controller";

export class AdminController extends Controller{

    public refillUserToken (req: any, res: any): void {
        let userEmail: string = req.body.email;
        let nToken: number = req.body.nToken;
        this.repo.refillUserToken(userEmail, nToken).then(() => {
            res.json(`Token added to user ${userEmail}, il nuovo numero di token è: ${nToken}`)
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })
    }
}