import { User } from "./DAOs/userDAO";
import { Document } from "./DAOs/documentDAO";
import { SignProcess } from "./DAOs/signProcessDAO";
import { Retryable, BackOffPolicy } from "typescript-retry-decorator";
import { IReadRepository } from "./readRepositoryInterface";
import { Op } from "sequelize";


export class readRepository implements IReadRepository{

    private static instance: readRepository;

    private constructor() {}

    public static getRepo(): readRepository {
        if(!readRepository.instance){
            this.instance = new readRepository();
        }
        return readRepository.instance;
    }

    /**
     * Restituisce lo stato di firma di un determinato documento, descrivendo nel dettaglio
     * chi sono i firmatari e chi di loro deve ancora apporre la firma e chi invece lo ha già
     * fatto
     * @param {number} document_id Id del documento del cui si vuole verificare lo stato 
     * del processo di firma
     * @returns {Promise<Array<SignProcess> | null>} lista dei partecipanti al processo di firma 
     * con relativo stato per ognuno oppure null nel caso in cui non ci sia alcun documento 
     * con l'id specificato
     */
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
           return document.SignProcesses;
        }
        return null;
    }

    /**
     * Restituisce il numero di token che l'utente può spendere attualmente considerando i 
     * processi di firma che quell'utente ha avviato
     * @param {string} codice_fiscale codice fiscale identificativo di un utente
     * @returns {Promise<number>} numero di token che l'utente può consumare
     */
    @Retryable({
      maxAttempts: 3,
      backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
      backOff: 1000,
    })
    async getTokenToBeConsumed(codice_fiscale: string): Promise<number> {
      let document = await Document.findAll({
        where: {
          codice_fiscale_richiedente: codice_fiscale,
          stato_firma: false
        },
        include: [
          {
            model: SignProcess,
          },
        ],
      });
      if (document !== null) {
        return document
          .map((element) => element.SignProcesses.length)
          .reduce((previous, current) => previous + current, 0);
      } else {
        return 0;
      }
    }

      /**
       * Recupera le challenging string associate ai challenging code impostati nel backend
       * @param {string} codice_fiscale identificativo dell'utente
       * @returns {Promise<Array<String> | null>} Lista delle challenging string o null 
       * nel caso in cui il codice fiscale non appartenga a nessun utente
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
      async getChallengingStrings(codice_fiscale: string): Promise<string[] | null> {
          let user = await User.findByPk(codice_fiscale);
          if (user !== null) {
            let challStrings: Array<string> = Array<string>();
            challStrings.push(user.challenging_string.slice(user.challenging_code_one * 2,
                user.challenging_code_one * 2 + 2));
            challStrings.push(user.challenging_string.slice(user.challenging_code_two * 2,
                user.challenging_code_two * 2 + 2));
            return challStrings;
          }
          return null;
      }

      /**
       * Ritorna la data di scadenza dei challenging codes associati a un utente
       * @param {string} codice_fiscale identificativo del particolare utente
       * @returns {Promise<Date | null>} data di scadenza dei codici o null se l'utente 
       * non esiste nel database
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
      async getChallCodeExp(codice_fiscale: string): Promise<Date | null>{
          let user = await User.findByPk(codice_fiscale);
          if(user !== null){
              return user.expiration;
          }
          return null;
      }

      /**
       * Recupera tutti i firmatari associati a un particolare documento
       * @param {number} document_id id del documento
       * @returns {Promise<Array<SignProcess> | null>} lista dei firmatari associati al 
       * documento o null se il documento non esiste
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
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

      /**
       * Ritorna tutti i dati di un utente 
       * @param {string} cf_user codice fiscale dell'utente
       * @returns {Promise<User | null>} dati dell'utente o null se esso non esiste
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
      async getUser(cf_user: string): Promise<User | null>{
          return await User.findByPk(cf_user);
      }

      /**
       * Ritorna tutti i dati dell'utente sulla base della sua email
       * @param {string} email 
       * @returns {Promise<User | null>} dati dell'utente o null se esso non esiste
       */
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
          });
      }

      /**
       * Ritorna tutti i dati di un documento sulla base del suo id
       * @param {number} document_id id del documento
       * @returns {Promise<Document | null>} istanza del documento o null se non esiste 
       * un documento con l'id passato
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
      async getDocument(document_id: number): Promise<Document | null>{
          return await Document.findByPk(document_id);
      }

      /**
       * Ritorna tutti i dati di un documento in base al suo hash
       * @param {string} hash hash del documento
       * @returns {Promise<Document | null>}
       */
      @Retryable({
          maxAttempts: 3,
          backOffPolicy: BackOffPolicy.FixedBackOffPolicy,
          backOff: 1000,
      })
      async getDocumentByHash(hash: string): Promise<Document | null>{
          return await Document.findOne({
              where: {
                  hash_documento: hash
              }
          });
      }

      /**
       * Controlla se tutti i firmatari presenti in una richiesta sono utenti registrati
       * 
       * @param {string[]} signers lista dei codici fiscali dei firmatari
       * @returns {Promise<boolean>} true se i firmatari sono tutti utenti registrati
       * false altrimenti
       */
      async checkSigners(signers: string[]): Promise<boolean>{
        let checked_signer:User[] = await User.findAll({
            where:{
                codice_fiscale:{
                    [Op.in]: signers
                }
            }
        });
        if(checked_signer.length === signers.length){
            return true;
        }
        else{
            return false;
        }
      }
}