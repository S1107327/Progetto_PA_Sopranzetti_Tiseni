import {Repository} from "../database/Models/repository";
import {readRepository} from "../database/Models/readRepository";

export class Controller {
    repo: Repository;
    readRepo: readRepository
    constructor(){
        this.repo = Repository.getRepo();
        this.readRepo = readRepository.getRepo();
    }
}