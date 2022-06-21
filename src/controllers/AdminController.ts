import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { Controller } from "./Controller";

export class AdminController extends Controller{

    /**
     * Funzione utilizzata dalla rotta admin per cambiare il numero di token disponibili ad un utente identificato
     * tramita la sua email
     * 
     * @param {any} req La richiesta che parte dal client e viene validata dai middleware precedenti
     * @param {any} res La risposta da inviare al client
     */
    public refillUserToken (req: any, res: any): void {
        let userEmail: string = req.body.email;
        let nToken: number = req.body.nToken;
        this.repo.refillUserToken(userEmail, nToken).then(() => {
            res.json(`Token added to user ${userEmail}, new token number is: ${nToken}`);
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError);
            res.status(error.status).json(error.message);
        })
    }
}