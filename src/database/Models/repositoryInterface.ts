import { Document } from "./DAOs/documentDAO";

export interface IRepository {
    //avvia il processo di firma e inserisce il documento associato a quel processo nel db
    startSignProcess(document_name: string, document_hash: string, codice_fiscale_richiedente: string, firmatari:Array<String>): Promise<Document>
    //permette a un utente di apporre una firma nel documento
    signDocument( document_id:number, codice_fiscale_richiedente: string): Promise<Boolean>
    //consuma il token di un utente che ha effettuato la richiesta di firma e ritorna il numero di token rimanenti
    consumeToken(codice_fiscale: string, token_number: number): any
    //annulla il processo di firma di un determinato documento
    cancelSignProcess(document_id: number): void 
    //ricarica i token di un determinato utente con una certa mail e restituisce il numero di token 
    refillUserToken(user_email: string, adding_token: number): Promise<void>
    // aggiorna i challenging code di un utente e la loro data di scadenza
    setChallengingCodes(codice_fiscale: string, codes: Array<number>, expiration: Date): void
}