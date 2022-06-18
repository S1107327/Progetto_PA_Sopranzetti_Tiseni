import { User } from "./DAOs/userDAO"
import { Document } from "./DAOs/documentDAO"
import { SignProcess } from "./DAOs/signProcessDAO"

export interface IReadRepository {
    //ritorna lo stato di un processo di firma di un particolare documento
    getSignProcessStatus(document_id: number): Promise<SignProcess[] |null>
    //recupera la stringa di challenging in base ai numeri forniti
    getChallengingStrings(codice_fiscale: string): Promise<string[] | null>
    //recupera la scadenza dei due challenging code
    getChallCodeExp(codice_fiscale: string): Promise<Date | null>
    //controlla se un utente è un firmatario
    getSignerById(document_id: number): Promise<SignProcess[] | null>
    getUser(cf_user: string): Promise<User | null>
    getDocument(document_id: number): Promise<Document | null>
    getDocumentByHash(hash: string): Promise<Document | null>
}