import { IRepository } from "./repositoryInterface";
import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
import { sequelize } from "../connection"
import { ConnectionError, ConnectionTimedOutError, TimeoutError, Transaction } from "sequelize";
import { Retryable, BackOffPolicy } from "typescript-retry-decorator"

// TODO: gestire eventuali errori
/** 
 * Classe per la gestione del repository pattern per l'accesso al database
*/
export class repository implements IRepository {

    /**
     * Questa funzione restituisce un booleano che indica quale è lo stato del processo di firma
     * di un documento.
     * @param document_id 
     * @returns Promise<boolean>
     */
    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getSignProcessStatus(document_id: number): Promise<boolean|null>{
        let document = await Document.findOne({
            where: {
                id: document_id
            },
        })
        return (document!==null) ? document.stato_firma : null
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
    async makeMultipleSign( document_name: string, document_hash: string, numero_firmatari: number, codice_fiscale_richiedente: string, ...codici_fiscali_firmatari: string[]) {
        var signList: object[]
        Document.create({
            nome_documento: document_name,
            hash_documento: document_hash,
            numero_firmatari: numero_firmatari,
            stato_firma: false,
            codice_fiscale_richiedente: codice_fiscale_richiedente
        })
        .then(async (result: any)=>{
            codici_fiscali_firmatari.forEach(element => {
                let signProcess = {
                    codice_fiscale_firmatario: element,
                    id_documento: result.id,
                    stato: false
                } 
                SignProcess.create({
                    codice_fiscale_firmatario: element,
                    id_documento: result.id,
                    stato: false
                })
            });
        })
        .catch((err: any)=>{})
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getChallengingString(codice_fiscale: string, challengingNumbers: number[]): Promise<string[] | null> {
        let user = await User.findOne({
            attributes: ['challenging_codes'],
            where: {
                codice_fiscale: codice_fiscale
            }
        })
        if (user !== null) {
            let challenginArray = user.challenging_codes.match(/.{3}/g);
            let challString: string[] = [challenginArray![challengingNumbers[0]], challenginArray![challengingNumbers[1]]];
            return challString
        }
        // TODO: cambiare quando si decide come gestire gli errori
        return null
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
    async getSignedDocument(document_id: number): Promise<string|null>{
        let document = await Document.findOne({
            where: {
                id: document_id
            }
        })
        if (document !== null)
            return null
        //TODO: cambiare quando si decide come gestire gli errori
        return null
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async makeSingleSign( document_name: string, document_hash: string,  codice_fiscale_richiedente: string) {
        await Document.create({
            nome_documento: document_name,
            hash_documento: document_hash,
            numero_firmatari: 1,
            stato_firma: false,
            codice_fiscale_richiedente: codice_fiscale_richiedente
        })
    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async checkUserPermission(document_id: number, cf_user: string): Promise<boolean> {
        let document = await  Document.findOne({
            where: {
                id: document_id
            },
            include: [{
                model: SignProcess,
                where: {
                    codice_fiscale_firmatario: cf_user
                }
            }]
        })
        if (document === null){
            return false
        }
        if (cf_user===document.codice_fiscale_richiedente /*|| cf_user===document.SignProcess.codice_fiscale_firmatario*/)
            return true

        return false

    }

    @Retryable({
        maxAttempts: 3,
        backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
        backOff: 1000,
    })
    async getUser(cf_user: string): Promise<User | null>{
        return await User.findOne({
            where: {
                codice_fiscale: cf_user
            }
        })
    }
    
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