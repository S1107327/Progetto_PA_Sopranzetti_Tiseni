import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
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
    async getChallengingStrings(codice_fiscale: string): Promise<string[] | null> {
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

    async getChallCodeExp(codice_fiscale: string): Promise<Date | null>{
        let user = await User.findByPk(codice_fiscale);
        if(user !== null){
            return user.expiration;
        }
        return null;
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
/* DA SPOSTARE*/
    async getSignerById(document_id: number): Promise<SignProcess[] | null> {
        let signers = await SignProcess.findAll(
            {
                where:{
                    id_documento: document_id,
                }
            }
        );
        if(signers !== null)
            return signers;
        else 
            return null;
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
    async getUserByEmail (email:string ): Promise<User | null>{
        return await User.findOne({
            where: {
                email_address: email
            }
        })
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