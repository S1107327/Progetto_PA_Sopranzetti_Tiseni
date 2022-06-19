import { readRepository } from "../database/Models/readRepository";
import { Repository } from "../database/Models/repository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";

export class AdminController {
    repo: Repository;
    readRepo: readRepository
    constructor(){
        this.repo = Repository.getRepo();
        this.readRepo = readRepository.getRepo()
    }

    public refillUserToken (req: any, res: any): void {
        let userEmail: string = req.body.email;
        let nToken: number = req.body.nToken;
        console.log("NEL CONTROLLER")
        this.repo.refillUserToken(userEmail, nToken).then(() => {
            res.json(`Token added to user ${userEmail}, il nuovo numero di token è: ${nToken}`)
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })
    }
}