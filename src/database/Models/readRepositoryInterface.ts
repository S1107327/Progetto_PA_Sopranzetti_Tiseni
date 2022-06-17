import { User } from "./DAOs/userDAO"
import { Document } from "./DAOs/documentDAO"
import { SignProcess } from "./DAOs/signProcessDAO"

export interface IReadRepository {
    //ritorna lo stato di un processo di firma di un particolare documento
    getSignProcessStatus(document_id: number): Promise<SignProcess[] |null>
    //recupera la stringa di challenging in base ai numeri forniti
    getChallengingString(codice_fiscale: string): Promise<string[] | null>
    //controlla il permesso di un utente di intervenire su un documento firmato
    checkUserPermission(document_id:number, cf_user: string): Promise<boolean>
    getUser(cf_user: string): Promise<User | null>
    getDocument(document_id: number): Promise<Document | null>
    getDocumentByHash(hash: string): Promise<Document | null>
}