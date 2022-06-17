import { IRepository } from "./repositoryInterface";
import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
import { sequelize } from "../connection"
import { ConnectionError, ConnectionTimedOutError, Sequelize, TimeoutError, Transaction } from "sequelize";
import { Retryable, BackOffPolicy } from "typescript-retry-decorator"

// TODO: gestire eventuali errori
/** 
 * Classe per la gestione del repository pattern per l'accesso al database
*/
export class repository implements IRepository {

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
        codice_fiscale_richiedente: string, firmatari: String[]): Promise<number> {
        let newDocument = await Document.create({
            nome_documento: document_name,
            hash_documento: document_hash,
            numero_firmatari: firmatari.length,
            stato_firma: false,
            codice_fiscale_richiedente: codice_fiscale_richiedente
        });
        for(let firmatario in firmatari){
            await SignProcess.create({
                codice_fiscale_firmatario: firmatario,
                id_documento: newDocument.id,
                stato: false
            });
        }
        return newDocument.id;
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
            await Document.destroy({
                where: {
                    id: document_id
                }
            }),{transaction: t}
            await SignProcess.destroy({
                where: {
                    id_documento: document_id
                }
            }),{transaction: t}
        })
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async refillUserToke(user_email: string, adding_token: number): Promise<number> {
        let user = await User.increment({
            numero_token: adding_token
        },
        {
            where: { email_address: user_email}
        })
        return user.numero_token
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