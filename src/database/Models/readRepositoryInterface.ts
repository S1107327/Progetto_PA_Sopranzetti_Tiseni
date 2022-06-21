import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";

export interface IReadRepository {
  // ritorna lo stato di un processo di firma di un particolare documento
  getSignProcessStatus(document_id: number): Promise<SignProcess[] | null>;
  // restituisce i token spendibili da un utente
  getTokenToBeConsumed(codice_fiscale: string): Promise<number> 
  // recupera la stringa di challenging in base ai numeri forniti
  getChallengingStrings(codice_fiscale: string): Promise<string[] | null>;
  // recupera la scadenza dei due challenging code
  getChallCodeExp(codice_fiscale: string): Promise<Date | null>;
  // recupera tutti i firmatari associati a un particolare documento
  getSignerById(document_id: number): Promise<SignProcess[] | null>;
  // ritorna un utente collegato a quel codice fiscale
  getUser(cf_user: string): Promise<User | null>;
  // ritorna un utente collegato a quell'email
  getUserByEmail(email: string): Promise<User | null>;
  // ritorna il documento con quell'id
  getDocument(document_id: number): Promise<Document | null>;
  // ritorna il documento associato a un certo hash
  getDocumentByHash(hash: string): Promise<Document | null>;
  // controlla se tutti i firmatari sono utenti registrati
  checkSigners(signers: string[]): Promise<boolean>
}
