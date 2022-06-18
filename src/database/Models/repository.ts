import { IRepository } from "./repositoryInterface";
import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
import { sequelize } from "../connection"
import { Transaction } from "sequelize";
import { Retryable, BackOffPolicy } from "typescript-retry-decorator"
import { setUncaughtExceptionCaptureCallback } from "process";

// TODO: gestire eventuali errori
/** 
 * Classe per la gestione del repository pattern per l'accesso al database
*/
export class Repository implements IRepository {

    private static instance: Repository;

    private constructor() {}

    public static getRepo(): Repository {
        if(!Repository.instance){
            this.instance = new Repository();
        }
        return Repository.instance;
    }

    /**
     * Funzione che si occupa di certificare sul database che è iniziato un nuovo processo di
     * firma di un documento, con i relativi firmatari. Ritorna al chiamante l'id del processo 
     * di firma
     * @param document_name nome del documento
     * @param document_hash hash del contenuto del documento e dei suoi firmatari
     * @param codice_fiscale_richiedente codice fiscale del richiedente del processo di firma
     * @param firmatari array contenente i codici fiscali di tutti i firmatari
     * @returns Promise<number>
     */
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async startSignProcess(document_name: string, document_hash: string, 
        codice_fiscale_richiedente: string, firmatari: string[]): Promise<Document> {
            let newDocument:Document = await sequelize.transaction(async (t: Transaction)=>{
                let newDocument = await Document.create({
                    nome_documento: document_name,
                    hash_documento: document_hash,
                    numero_firmatari: firmatari.length,
                    stato_firma: false,
                    codice_fiscale_richiedente: codice_fiscale_richiedente
                }, {transaction: t});
            for(let firmatario in firmatari){
                await SignProcess.create({
                    codice_fiscale_firmatario: firmatari[firmatario],
                    id_documento: newDocument.id,
                    stato: false
                }, {transaction:t});
            }
            return newDocument;
        });        
        return newDocument;
    }
     /**
     * Funzione che peremette a una qualsiasi firmatario coinvolto in un processo di firma 
     * di apporre la firma sul documento. Ritorna true se la firma apposta ha concluso il 
     * processo di firma e false altrimenti.
     * @param document_id id del documento e del processo di firma
     * @param codice_fiscale codice fiscale del firmatario che deve apporre la firma
     * @returns Promise<boolean>
     */
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async signDocument( document_id:number, codice_fiscale: string): Promise<Boolean>{
        let firmatari = await SignProcess.findAll({
            where:{
                id_documento: document_id,
                stato: false
            }
        });
        await SignProcess.update({ stato: true }, {
            where: {
            id_documento: document_id,
            codice_fiscale_firmatario: codice_fiscale
            }
        });
        if(firmatari.length <= 1){
            await Document.update({stato_firma: true},{
                where:{
                    id: document_id
                }
            })
            return true;
        }else{
            return false;
        }
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async cancelSignProcess(document_id: number) {
        await sequelize.transaction(async (t: Transaction)=>{
            await SignProcess.destroy({
                where: {
                    id_documento: document_id
                },
                transaction:t
            });
            await Document.destroy({
                where: {
                    id: document_id
                },
                transaction:t
            });
        });
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async refillUserToken(user_email: string, adding_token: number): Promise<void> {
        let user = await User.update({
            numero_token: adding_token
        },
        {
            where: { email_address: user_email}
        })
    }
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async consumeToken(codice_fiscale: string, token_number: number){
        await User.increment({
            numero_token: -token_number
        },
        {
            where: { codice_fiscale: codice_fiscale}
        })
    }
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async setChallengingCodes(firmatario: string, codes: Array<number>, expiration: Date){
        await User.update({
            challenging_code_one: codes[0],
            challenging_code_two: codes[1],
            expiration: expiration
        },{
            where: {
                codice_fiscale:firmatario
            }
        });
    }

/* DA TOGLIERE*/
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async test() {
        return await User.findAll(
            {
                include:[{
                    model: SignProcess
                },{
                    model: Document
                }]
            }
        );
    }
}