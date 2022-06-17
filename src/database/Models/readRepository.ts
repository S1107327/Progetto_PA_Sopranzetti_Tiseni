import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
import { ConnectionError, ConnectionTimedOutError, Sequelize, TimeoutError, Transaction } from "sequelize";
import { Retryable, BackOffPolicy } from "typescript-retry-decorator"
import { IReadRepository } from "./readRepositoryInterface";


export class readRepository implements IReadRepository{

    private static instance: readRepository;

    private constructor() {}

    public static getRepo(): readRepository {
        if(!readRepository.instance){
            this.instance = new readRepository();
        }
        return readRepository.instance;
    }

    /* DA SPOSTARE*/
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getSignProcessStatus(document_id: number): Promise<SignProcess[] |null>{
        let document = await Document.findByPk(document_id,{
            include: [{
                model: SignProcess,
            }]
        });
        console.log(document?.created_at);
        if (document !== null && document.SignProcesses !== undefined){
           return document.SignProcesses
        }
        return null
    }
    /* DA SPOSTARE*/
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getChallengingString(codice_fiscale: string): Promise<string[] | null> {
        let user = await User.findByPk(codice_fiscale);
        if (user !== null) {
            let challStrings: Array<string> = Array<string>();
            challStrings.push(user.challenging_string.slice(user.challenging_code_one*2, 
                                                            user.challenging_code_one*2 + 2));
            challStrings.push(user.challenging_string.slice(user.challenging_code_two*2, 
                                                            user.challenging_code_two*2 + 2));
            return challStrings
        }
        return null
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
/* DA SPOSTARE*/
    async checkUserPermission(document_id: number, cf_user: string): Promise<boolean> {
        let document = await  Document.findByPk(document_id,{
            include: [{
                model: SignProcess,
                where: {
                    codice_fiscale_firmatario: cf_user
                }
            }]
        });
        if (document === null || document.SignProcesses === undefined){
            return false
        }
        if (cf_user===document.codice_fiscale_richiedente || cf_user===document.SignProcesses[0].codice_fiscale_firmatario)
            return true
        return false
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getUser(cf_user: string): Promise<User | null>{
        return await User.findByPk(cf_user);
    }
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getDocument(document_id: number): Promise<Document | null>{
        return await Document.findByPk(document_id);
    }
    async getDocumentByHash(hash: string): Promise<Document | null>{
        return await Document.findOne({
            where: {
                hash_documento: hash
            }
        });
    }
}