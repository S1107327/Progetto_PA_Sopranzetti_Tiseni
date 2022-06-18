import { readRepository } from "database/Models/readRepository";
import { Repository } from "database/Models/repository";
import { errorFactory } from "errors/error-factory";
import { ErrEnum } from "errors/error-types";

export class AdminController {
    repo: Repository;
    readRepo: readRepository
    constructor(){
        this.repo = Repository.getRepo();
        this.readRepo = readRepository.getRepo()
    }

    public refillUserToken (req: any, res: any): void {
        //TODO: ricontrollare dopo che viene deciso come come passare l'id dell'utente
        //TODO: si suppone a questo punto che l'id dell'utente sia stato controllato e che sia valido
        //TODO: si suppone a questo punto che il numero di token siano stati validati e che sia un numero valido
        let userEmail: string = req.body.userEmail;
        let nToken: number = req.body.nToken;
        this.repo.refillUserToken(userEmail, nToken).then(() => {
            res.json(`Token added to user "${userEmail}", il nuovo numero di token è: ${nToken}`)
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })
    }
}