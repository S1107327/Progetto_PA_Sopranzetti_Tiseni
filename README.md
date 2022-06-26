# Progetto_PA_Sopranzetti_Tiseni
## Obiettivo di progetto
L'obiettivo del progetto è di realizzare un sistema che consenta di gestire il processo di creazione e firma di documenti mediante openssl. In particolare, il back-end deve consentire di compiere le seguenti operazioni (tutte autenticate con un token JWT):
- Creare per un utente, se non esiste, un certificato prelevando i valori per la creazione dello stesso direttamente dal token JWT utilizzato per l'autenticazione.
- Invalidare un certificato associato all'utente.
- Richiedere la firma di un documento che viene inviato al back-end. Si deve prevedere sia una firma singolo utente che multi utente.
- Annullare un dato processo di firma. In questo caso solo chi ha avviano il processo lo può terminare.
- Chiedere lo stato del processo di firma. Anche in questo caso solo chi ha avviato il processo lo può terminare.
- Ottenere il file firmato (p7m). Solo chi partecipa al processo di firma può scaricare il file.
- Per ogni richiesta andata a buon fine viene scalato un credito pari a k token con k uguale al numero di partecipanti al processo di firma. In questo caso, la richiesta di firma deve essere rifiuatata se il numero di token non è sufficiente, resitutento all'utente 401 Unauthorized.
- Restituire il credito residuo di un utente.
- Un utente con il ruolo di admin deve poter ricaricare i token di un utente fornendo la mail e il nuovo "credito".

### Alcuni dettagli
- In generale, il token JWT utilizzato per autenticare tutte le richieste è sempre il medesimo e contiene un payload JSON con i seguenti campi:

  -	commonName=Adriano Mancini
  -	countryName=IT
  -	stateOrProvinceName=FM
  -	localityName=Fermo
  -	organizationName=ACME
  -	organizationalUnitName=IT
  -	emailAddress=demo@mailinator.com
  -	serialNumber=MNCDRN82T30D542U
  -	dnQualifier=20175007693
  -	SN=Mancini 
  -	role=user

  Per gli utenti admin nel campo role ci sarà scritto "admin" invece che "user".

- Nel momento in cui si verifica il numero di token di un utente, ovvero quando esso chiede di avviare un nuovo processo di firma, nel conteggio si fa riferimento anche al numero di token "impegnati" dell'utente, ovvero quei token che l'utente potrebbe utilizzare in futuro qualora dei processi di firma che esso aveva già avviato andassero a buon fine. Questo serve ad evitare che un utente possa avviare più processi di firma di quanti se ne può effettivamente permettere una volta che saranno completati.
 
- Per ogni utente, nel caso di firma multipla, viene utilizzata sempre la stessa PEMPASSPHRASE, ovvero la stessa password. Questo viene fatto perché openssl non prevede un comando che consenta di inserire più password nel caso di firme multiple.


## Progettazione

### Diagramma dei casi d'uso

Per rappresentare in maniera schematica tutte le richieste e gli obiettivi di progetto si è prodotto un diagramma dei casi d'uso.

![alt text](./res-readme/usecase-diagram.jpg)

Per ognuno di questi casi si sono definite, dunque, delle rotte nell'applicazione.
#### Rotte

Le rotte dell'applicazione sono state definite nel seguente modo:

| Rotta        | Metodo | Funzione  |
| ------------- | ------------- | ----- |
| / | GET | Benvenuto |
| /create | GET | Creare un proprio certificato |
| /invalidate | GET | Invalidare un certificato associato all'utente |
| /credit | GET | Visualizzare il credito residuo |
| /download/:id | GET | Ottenere il file firmato |
| /sign/start | POST | Iniziare un processo di firma |
| /sign/cancel/:id | GET | Annullare il processo di firma |
| /sign/status/:id | GET | Chiedere lo stato del processo di firma |
| /sign/getchallnumbers | GET | Recuperare i challenging codes |
| /sign/:id | POST | Firmare un documento |
| /admin/refill | POST | Aggiornamento dei token di un utente|

- Rotta: **/**

Questa rotta ha semplicemente il compito di inviare un messaggio di benvenuto all'utente.

- Rotta: **/create**

Rotta dedicata al processo di creazione di un nuovo certificato. All'utente sarà necessario fare una richiesta a questa rotta, dopo aver impostato correttamente il proprio token JWT, per creare un proprio certificato nell'applicazione. Tutti i dati per crearlo, infatti, sono recuperati direttamente dal token come da specifiche.

Qualora la creazione del certificato andasse a buon fine all'utente viene tornato un messaggio che conferma la corretta creazione del certificato indicando i dati inseriti.

- Rotta: **/invalidate**

Un utente può utilizzare questa rotta per invalidare il proprio certificato, qualora ne abbia uno. Anche in questo caso è sufficiente invocare la rotta con il proprio token JWT per invalidare il proprio certificato.

Se l'invalidazione va a buon fine viene tornato all'utente un messaggio che ne certifica e conferma l'invalidazione. Una volta che un utente ha invalidato il proprio certificato potrà sempre crearne un altro in futuro.

- Rotta: **/credit**

L'utente può, in questo modo, visualizzare il proprio credito residuo in token. Basta chiamare questa rotta dopo aver impostato il proprio token JWT. 

All'utente verrà ritornato, in risposta, un oggetto che contiene due campi: uno indica il codice fiscale dell'utente, l'altro l'attuale numero di token.

- Rotta: **/download/:id**

Si utilizza per scaricare un determinato documento del quale è terminato il processo di firma. Si deve indicare nella rotta l'id del documento stesso, che viene tornato all'utente ogni volta che si avvia un nuovo processo di firma. Come per le altre rotte, le informazioni riguardanti l'identità dell'utente che sta richiedendo il documento vengono recuperate direttamente dal token JWT.

- Rotta: **/sign/start**
  
Consente di avviare un nuovo processo di firma. Affiché questa rotta funzioni correttamente l'utente deve indicare nel body della richiesta: un campo contenente il documento da caricare sul server, provvisto di estensione, avente come chiave la parola "document", e altri campi, sotto forma di array, contenenti i codici fiscali dei firmatari del documento.

![alt text](./res-readme/sign-start.png "Sign-start")

Se la richiesta va a buon fine all'utente viene ritornato un messaggio di conferma e l'id del documento del quale si è avviato il processo. Questo id sarà necessario per tutte le altre rotte che lo richiedono.

Si sottolinea come la richiesta che deve essere effettuata all'applicazione deve essere di tipo "*multipart/form-data*". Questa scelta è stata fatta perché rende molto più semplice l'upload di file rispetto all'utilizzo di un body in JSON.

In alternativa se non si vuole utilizzare il client postman come indicato nell'immagine si può utilizzare l'applicativo "curl" nella seguente modalità:

```
curl -X POST -F document=@.<<path del documento da caricare>> -F firmatari[0]="LSPDRN94T30D542U" -F firmatari[1]="TSNLNZ99E06E690J" http://0.0.0.0:8080/sign/start -H "Authorization: Bearer <<token JWT dell'utente>>"
```


- Rotta: **/sign/cancel/:id**

Permette di terminare un determinato processo di firma il cui id viene indicato nella rotta. Si sottolinea come l'id del processo di firma sia lo stesso del documento al quale quel processo fa riferimento, la separazione fra i due è solo concettuale. 

Cancellare un processo di firma permette di eliminare tutte le informazioni sui firmatari e sul documento dal database dell'applicazione eliminando anche il documento stesso dal server.

Nel caso in cui la cancellazione andasse a buon fine viene ritornato un messaggio di conferma all'utente.

- Rotta: **/sign/status/:id**

Questa rotta può essere utilizzata per recuperare informazioni sulla stato di un processo di firma. 

Nella rotta si deve indicare l'id del processo di firma voluto.

All'utente che effettua la richiesta vengono ritornate una serie di informazioni che contengono, per ogni firmatario, il codice fiscale dello stesso e un campo che indica se quel firmatario ha già apposto la firma o meno.

- Rotta: **/sign/getchallnumbers**

Chiamando questa rotta vengono ritornati all'utente i challenging codes per effettuare successivamente la firma. I challenging codes hanno una durata di due minuti. L'utente viene identificato dall'applicazione mediante le informazioni nel token JWT.

- Rotta: **/sign/:id**

Consente di firmare un determinato documento indicandone l'id nella rotta.

Nel body della richiesta vanno indicati i challenging codes che devono essere stati richiesti in precedenza mediante la rotta apposita inserendoli nello stesso ordine con cui sono stati ritornati. Il body deve essere un JSON formattato nel seguente modo:

```JSON
{
  "codes":[
    "af",
    "bc"
  ]
}
```


Nel caso in cui il processo di firma andasse a buon fine viene ritornato all'utente un messaggio che conferma l'avvenuta firma. 

- Rotta: **/admin/refill**

Questa è la rotta dell'admin che consente di cambiare i token associati a un utente.

Per fare la richiesta è necessario che nel token JWT sia impostato come ruolo "admin" e che nel body della richiesta vengano inseriti la mail dell'utente del quale si vogliono modificare i token e il nuovo numero di token formattati nel seguente modo: 

```JSON
{
    "email": "demo@mailinator.com",
    "nToken": 10
}
```
All'utente verrà ritornato un messaggio che conferma l'avvenuto cambiamento del numero di token dell'utente.

### Diagramma delle classi

Per ogni macro elemento dell'applicazione è stato costruito un diagramma delle classi per rappresentarne schematicamente la struttura. 

Legenda:
- Giallo: elementi che rappresentano un modulo typescript.
- Blu: elementi che rappresentano classi typescript
- Rosa: interfacce

#### Node server base
![alt text](./res-readme/class-diagram-node.jpg)

In questa parte di applicazione sono presenti tre elementi:
- [index.ts](./src/index.ts): crea il server express e si occupa, principalmente, di gestire gli errori di mal-formattazione dei payload json, e di indicare all'applicazione di utilizzare i router in maniera corretta.
- [route.ts](./src/route.ts): gestisce, attraverso un router, tutte le rotte dell'applicazione che non concernono il processo di firma specificando la catena di middleware per la richiesta e chiamando infine la corretta funzione del controller.
- [route-sign.ts](./src/route-sign.ts): gestisce, attraverso un router, tutte le rotte dell'applicazione per il processo di firma specificando la catena di middleware per la richiesta e chiamando infine la corretta funzione del controller.

#### Controller
![alt text](./res-readme/class-diagram-controller.jpg)

I controller dell'applicazione sono:
- [Controller](./src/controllers/Controller.ts): è la classe base di tutti i controller e contiene i campi "readRepo" e "repo" che sono dei riferimenti alle repository, utili per tutte le operazioni che richiedono interazioni con i database.
- [AdminController](./src/controllers/AdminController.ts): identifica il controller per l'admin, essa contiene il metodo per cambiare i token di un determinato utente.
- [SignController](./src/controllers/SignController.ts): si occupa di gestire tutte le operazioni riguardanti la firma o il processo di firma di un documento.
- [UserController](./src/controllers/UserController.ts): è il controller per l'utente base e contiene al suo interno diverse operazioni che l'utente può compiere, escludendo quelle per il processo di firma che si trovano nel controller dedicato.

#### Database
![alt text](./res-readme/class-diagram-database.jpg)
Nella parte che si relaziona con il database sono presenti i seguenti elementi:
- [connection.ts](./src/database/connection.ts): si occupa di fare la connessione al database attraverso "sequelize" indicando tutti i parametri necessari.
- [SignProcess](./src/database/Models/DAOs/signProcessDAO.ts): DAO costrutito attraverso le funzionalità fornite da sequelize che mappa la tabella del database contenente i processi di firma.
- [User](./src/database/Models/DAOs/userDAO.ts): DAO costruito attraverso sequelize che mappa la tabella del database contenente gli utenti.
- [Document](./src/database/Models/DAOs/documentDAO.ts): DAO costruito attraverso sequelize che mappa la tabella del database contenente le informazioni sui documenti. 
- [IReadRepository](./src/database/Models/readRepositoryInterface.ts): interfaccia della repository che contiene tutte le operazioni di lettura sul database.
- [IRepository](./src/database/Models/repositoryInterface.ts): interfaccia della repository che contiene le operazioni di scrittura sul database.
- [readRepository](./src/database/Models/readRepository.ts): implementa la corrispondente interfaccia. Questa classe è costruita in maniera tale da essere un singleton, infatti è previsto un metodo "getRepo()" per poter accedere all'unica istanza della classe.
- [Repository](./src/database/Models/repository.ts): anche questa è una classe singleton che implementa la corrispondente interfaccia.

Entrambe queste repository fanno uso di tutti e tre i DAO descritti per intervenire sul database in maniera rapida ed efficiente.

#### Errori
![alt text](./res-readme/class-diagram-errors.jpg)

Il modulo contenente tutti gli errori dell'applicazione presenta:
- [error-factory.ts](./src/errors/error-factory.ts):  contiene la factory vera e propria degli errori attraverso la quale è possibile recuperare la giusta istanza del giusto errore quando necessario.
- [error-messages.ts](./src/errors/error-messages.ts): contiene tutti i messaggi degli errori personalizzati dell'applicazione. Tutte queste stringhe sono state racchiuse in un unico modulo per renderne più facile l'individuazione e l'eventuale modifica.
- [ErrorMsg](./src/errors/error-types.ts): interfaccia comune a tutti gli errori personalizzati dell'applicazione. Contiene due attributi "status" e "message". Il primo indica lo status code da ritornare al client, mentre il secondo il messaggio di errore da ritornare al client.
- [GenericError](./src/errors/error-types.ts): è l'errore più generale tra quelli realizzati ed estende "Error" ovvero l'errore più generale di Typescript. Questa classe si occupa di impostare lo status code e il messaggio da tornare al client, nel caso in cui non venga passato nulla al costruttore, verrà automaticamente impostato un messaggio di default e uno status code 500.

Tra gli altri errori presenti, alcuni di essi estendono direttamente GenericError cambiandone messaggio e status code, essi sono: "NotFound", "Forbidden", "ValidationError" e "Unauthorized". Altri invece, essendo errori a "livello più basso", estendono a loro volta errori come "NotFound" o "Forbidden" andandone a cambiare solamente il messaggio di errore ma non lo status code, alcuni esempi sono: "InvalidEmail", InvalidId" o "CertAlreadyExistError".

L'intera gerarchia e struttura degli errori è visibile nell'immagine.


### Diagrammi delle sequenze

Per ogni rotta dell'applicazione, ad eccezione di quella di bevenuto, è stato definito un diagramma delle sequenze che spiega cosa accade internamente e quali sono le componenti attraversate dalla richiesta.

Come già detto in precedenza, tutte le richieste all'applicazione sono autenticate mediante token JWT, dunque i primi middleware sono sempre gli stessi e servono per verificare questo token, in particolare:
- [**checkHeader()**](./src/middleware/mw-auth-JWT.ts): controlla se nella richiesta sia presente l'authorization header.
- [**checkToken()**](./src/middleware/mw-auth-JWT.ts): controlla se nell'header della richiesta è presente un Bearer token ovvero il token JWT. 
- [**verifyAndAuthenticate()**](./src/middleware/mw-auth-JWT.ts): verifica se il token è valido controllando che la chiave segreta utilizzata per la cifratura sia corretta e che il token non sia scaduto. 
- [**checkJWTPayload()**](./src/middleware/mw-auth-JWT.ts): controlla se il payload del token è corretto secondo le specifiche verificando elemento per elemento del body. 
- [**checkUserAuthJWT()**](./src/middleware/mw-async-db.ts): controlla se l'utente, i cui dati sono codificati nel token, sia uno tra quelli registrati nell'applicazione, in particolare, si verifica se il codice fiscale presente nel token corrisponde ad uno di quelli presenti nel database.

Si vuole sottolineare inoltre che, in tutti i casi in cui è necessario richiamare il database, i middleware e i controller si avvalgono delle due classi repository come indicato nei diagrammi.

#### **Rotta /create**
![alt text](./res-readme/sequence-diagram-certificato.jpg)

Nella rotta per la creazione di un certificato oltre ai classici middleware è presente:
- [**checkCertificateAlreadyExist()**](./src/middleware/mw-validation.ts): controlla se nella directory del filesystem contenente i certificati degli utenti sia già presente un certificato per l'utente che sta facendo la richiesta, in quel caso la richiesta viene bloccata.

Superati tutti i middleware, il controller genera tutti i file necessari per la creazione del certificato dell'utente e il certificato stesso, salvandoli nelle cartelle dedicate. Ritorna, infine, un messaggio che indica all'utente l'avvenuta creazione del certificato.

#### **Rotta /invalidate**
![alt text](./res-readme/sequence-diagram-invalidare.jpg)

I controlli peculiari della rotta sono:
- [**checkCertificateNotExist()**](./src/middleware/mw-validation.ts): controlla se l'utente che sta richiedendo l'invalidazione del certificato ne abbia effettivamente uno. 

Il controller si occupa di invalidare il certificato, eliminando tutti i file per la firma digitale associati a quell'utente. Ritorna poi un messaggio di conferma all'utente.

#### **Rotta /credit**
![alt text](./res-readme/sequence-diagram-credito.jpg)

Nel momento in cui l'utente richiede il proprio credito non sono presenti particolari middleware oltre a quelli per la validazione del token.

In questo caso il controller si occupa solamente di recuperare il numero di token dell'utente che ha fatto la richiesta e di inviare la risposta al client. 

#### **Rotta /download/:id**
![alt text](./res-readme/sequence-diagram-firmato.jpg)

In questo caso sono presenti diversi middleware aggiuntivi data la complessità della richiesta:
- [**checkId()**](src/middleware/mw-async-db.ts): questo middleware effettua due controlli:
  - verifica se l'id indicato è un numero intero positivo. 
  - verifica che l'id corrisponda a un documento realmente esistente nell'applicazione.
- [**checkIfSignerOrApplicant()**](src/middleware/mw-async-db.ts): middleware che controlla se l'utente che sta facendo la richiesta sia effettivamente un utente autorizzato, ovvero un firmatario o il richiedente.
- [**checkIfSigned()**](src/middleware/mw-async-db.ts): verifica se il processo di firma del documento corrispondente all'id indicato sia effettivamente completato e il documento sia stato firmato. 
 
Se tutte le verifiche vanno a buon fine, il controller recupera le informazioni sul documento dal database effettuando l'apposita chiamata, in seguito, utilizzato l'hash del documento e la data di creazione recupera il file vero e proprio dal filesystem e avvia il processo di download.

#### **Rotta /sign/start** 

![alt text](./res-readme/sequence-diagram-start.jpg)

La rotta che permette a un utente registrato di iniziare un processo di firma, oltre a quelli legati al JWT, ha montati una serie di moduli middleware, che si occupano di perseguire una serie di controlli di integrità sul processo di firma:
- [**upload.single()**](./src/utils/multer-config.ts):  creato grazie alla libreria multer, si occupa di verificare che nel payload della richiesta ci sia un campo "document" contenente un file. Esso viene attivato solo nel momento in cui è presente un campo contenente un file nel body della richiesta
- [**checkFormData()**](src/middleware/mw-async-db.ts): opera una serie di controlli sul payload della richiesta. Per prima cosa, verifica se sono valorizzati tutti i campi della richiesta;successivamente verifica che non ci siano ripetizioni tra i firmatari; infine controlla che tutti i firmatari indicati siano utenti registrati.
- [**checkIfAlreadyExistOrSigned()**](src/middleware/mw-async-db.ts): impedisce di avviare il processo di firma nel momento in cui esista un altro processo di firma che coinvolge lo stesso documento(stesso contenuto) e gli stessi firmatari. In caso contrario lascia passare la richiesta al middleware successivo.
- [**checkTokenQty()**](src/middleware/mw-async-db.ts): evita che un utente possa avviare un processo di firma con un numero di firmatari superiore al numero di token a sua disposizione. I token a disposizione di un utente sono quelli registrati nel database meno quelli impegnati in altri processi di firma.

Nel caso in cui tutti i controlli sono superati la richiesta arriva filtrata e processata al controller, che si occupa, mediante i metodi del repository, di creare l'istanza del documento e di tutti i firmatari partecipanti nelle tabelle del database

#### **Rotta /sign/cancel/:id**

![alt text](./res-readme/sequence-diagram-cancellazione.jpg)

Nel momento in cui l'utente fa una richiesta di annullamento di un processo di firma, contrassegnato dall'id passato come parametro, partono una serie di delicati controlli operati dai middleware montati sulla rotta:
- [**checkId()**](#rotta-downloadid). 
- [**checkIfApplicant()**](src/middleware/mw-async-db.ts): controlla se l'utente che ha inviato la richiesta è il richiedente che ha avviato il processo di firma associato a quell'id.
- [**checkIfCompleted()**](src/middleware/mw-async-db.ts): impedisce a un utente di annullare o invalidare un processo di firma già concluso.

Nel momento in cui la richiesta supera tutte le verifiche viene processata dal controller. Esso elimina dal database tutti i dati collegati al processo di firma annullato e cancella sul server il documento da firmare.

#### **Rotta /sign/status/:id**

![alt text](./res-readme/sequence-diagram-stato.jpg)

Sulla rotta che permette a un utente di vedere lo stato di un processo di firma sono montati due middleware già discussi nella rotta precedente:
- [**checkId()**](#rotta-downloadid)
- [**checkIfApplicant()**](#rotta-signcancelid)

Superate le due verifiche citate, viene richiamata una funzione del controller, dedicato ai processi di firma, che si occupa di recuperare in lettura dal database le informazioni richieste sul processo di firma.

#### **Rotta /sign/getchallnumbers**

![alt text](./res-readme/sequence-diagram-codes.jpg)

Oltre ai middleware relativi alla verifica del payload del token JWT, la rotta corrente non monta middleware specifici, quindi superato il primo blocco di controlli la richiesta viene processata dal controller.

Il controller genera due numeri casuali, i challenging codes, e li salva nel database insieme alla loro data di scadenza, ritornandoli poi al client.

**Rotta /sign/:id**

![alt text](./res-readme/sequence-diagram.jpg)

La richiesta di firmare un documento è una richiesta molto delicata. Per questo la rotta associata monta molti middleware, per operare i necessari controlli di integrità:

- [**checkChallJSONBody()**](src/middleware/mw-validation.ts): controlla che il body JSON della richiesta sia formattato nella maniera descritta in precedenza.
- [**checkId()**](#rotta-downloadid)
- [**checkCertificateNotExist()**](src/middleware/mw-validation.ts): impedisce a un utente che non possiede un certificato valido sul server di proseguire nella firma del documento indicato.
- [**checkSigner()**](src/middleware/mw-async-db.ts): verifica che l'utente è abilitato alla firma del documento richiesto, perchè specificato tra i firmatari dello stesso.
- [**checkExpiration()**](src/middleware/mw-async-db.ts): per prima cosa controlla se sono stati richiesti dei challenging codes, dall'utente che fa la richiesta. Se la condizione è soddisfatta si verifica anche che i due codici non siano scaduti.
- [**checkChallString()**](src/middleware/mw-async-db.ts): confronta le stringhe nella richiesta, con quelle associate ai codici correnti e salvate nel database. Se le stringhe fornite sono uguali e nell'ordine corretto viene abilitata la firma.

Superate tutte le verifiche necessarie il controller  registra nel database la firma di chi ha fatto la richiesta. Inoltre, se il firmatario che ha fatto la richiesta era l'ultimo rimasto, il controller si occupa di aggiornare lo stato del documento sul database, marcandolo come firmato. Infine, esegue sul server il comando openssl che produce il documento firmato.

#### Rotta **/admin/refill**
![alt text](./res-readme/sequence-diagram-admin.jpg)

Per l'unica rotta dedicata all'admin i controlli da effettuare sono:
- [checkIfAdmin()](./src/middleware/mw-auth-JWT.ts): controlla che l'utente che sta facendo la richiesta sia effettivamente un admin, controllando il campo role nel token JWT. 
- [checkUserEmail()](src/middleware/mw-validation.ts): controlla se l'email dell'utente, impostata dall'admin nella richiesta, abbia un formato valido. 
- [checkIfUserEmailExist()](src/middleware/mw-async-db.ts): verifica che l'email inserita dall'admin corrisponda alla email di un utente registrato nell'applicazione. 
- [checkTokenNumber()](./src/middleware/mw-validation.ts): controlla che il nuovo numero di token inserito dall'admin nella richiesta sia un intero positivo. 

Quindi, il controller si occuperà di aggiornare il numero di token disponibili per l'utente con la particolare email.

#### **Rotta /sign/cancel/:id**
![alt text](./res-readme/sequence-diagram-cancellazione-errore.jpg)

Infine, per completezza si riporta un caso in cui uno dei middleware vada in errore. In questo caso si può notare come la richiesta non arrivi al controller ma venga bloccata dal middleware [checkIfApplicant()](src/middleware/mw-async-db.ts). In caso di errori, vengono autoamticamente richiamati i middleware che si occupano di gestirli.




### Pattern
#### **Factory**
La factory è un design pattern creazionale che fornisce una interfaccia per la creazione di oggetti. Essa consiste nel delegare ad un unico oggetto, chiamato factory, la creazione di oggetti molto simili che implementano un'interfaccia comune.

L'utilizzo più comune di questo pattern che è stato implementato nell'applicazione è quello della gestione degli errori. Infatti tutti gli errori personalizzati hanno in comune due proprietà, ovvero status code e messaggio di errore. Per questo, il design pattern applicato alla costruzione degli errori permette di semplificarne la gestione delegando alla factory la costruzione dell'errore.
#### **Chain of Responsibility**
La chain of responsibility è un design pattern comportamentale che consente di passare una richiesta attraverso multipli handler che intervengono in vario modo e in maniera incrementale su di essa. Questo permette, nel caso ci siano molteplici controlli da fare, di non creare un flusso di esecuzione dell'applicazione troppo complesso e difficile da manutenere. Il funzionamento è molto semplice, ogni handler effettua uno o più controlli sulla richiesta e, solo se tutti i controlli vengono superati la richiesta viene passata all'handler successivo. In caso di errore, invece, si blocca l'esecuzione.

Nell'applicazione, data la grande mole di controlli da effettuare, si è reso necessario utilizzare questo pattern. I vari handler sono stati implementati attraverso delle middleware function messe a disposizione da express. Ogni middleware function può accedere alla richiesta, alla risposta e ha un riferimento al middleware successivo. Questo consente di effettuare tutti i controlli sulle richieste in catena potendo in qualsiasi momento ritornare un errore nel caso in cui i controlli non vadano a buon fine.

Questo risulta fondamentale per validare tutte le richieste dell'utente impedendo che arrivino delle richieste malevoli o sbagliate al controller, che possano modificare, irreparabilmente, lo stato interno del server. Un ulteriore vantaggio dato dal pattern è che si evitano le ripetizioni di codice in quando lo stesso middleware può esse utilizzato per più richieste.

#### **Singleton**
Il singleton è un design pattern creazionale che forza una classe ad avere una sola istanza.
Nell'applicazione il singleton viene utilizzato nella [connessione](src/database/connection.ts) al database e nelle classi delle repository ([Repository](./src/database/Models/repository.ts) e [readRepository](src/database/Models/readRepository.ts)). Nel primo caso il singleton risulta necessario perché avere multiple connessioni al database produce un overhead troppo grande. Nel secondo caso, il singleton è stato utilizzato perché le repository vengono chiamate in molte parti del programma, questo avrebbe prodotto un numero di istanze esageratamente grande e non necessario. Con il singleton si è così limitato il numero di istanze risparmiando molte risorse.

#### **DAO**
Il design pattern DAO(Data Access Object), si utilizza quando è necessario creare l'astrazione di uno strato di persistenza dei dati, come quello rappresentato da un database. Esso permette di dividere il livello applicazione dallo strato di persistenza, facilitando qualsiasi tipo di operazione CRUD, e svincolandola dallo strato sottostante. 

Tipicamente una best practice, che è stata adottata durante la progettazione dell'applicazione, consiste nel creare una classe DAO per ognuna delle tabelle presenti all'interno del database. In essa sono definite come proprietà di una classe gli attributi della tabella, e come metodi le operazioni CRUD. L'uso dei DAO era chiaramente necessario nel caso dell'applicazione progettata, che si appoggia su un database relazionale con tre tabelle.

Nell'implementazione ci si è affidati all'ORM [Sequelize](https://sequelize.org/), in quanto altrimenti si sarebbero dovute implementare da zero le funzionalità CRUD del DAO. Sequelize permette di definire dei DAO, o Model, che espongono nativamente una serie di metodi per operare query sullo strato di persistenza. Nella definizione dei DAO ci si è attenuti alla documentazione di Sequelize.

#### **Repository**

Il repository è un design pattern che si colloca a un livello di astrazione superiore rispetto al DAO. Le funzionalità del repository consistono in:
- preparare i dati per la memorizzazione, passanodoli poi al DAO per salvarli nello strato di persistenza.
- recuperare, attraverso i DAO, informazioni provenienti dal database restituendole in un formato adeguato per l'elaborazione. 

Tipicamente i repository possono utilizzare allo stesso tempo più di un DAO. Questo è stato decisivo nella scelta di adottare il pattern nell'applicazione. Possedendo un insieme di tre tabelle sul database, se non si fosse implementato un repository si sarebbero dovuti utilizzare direttamente i DAO nel controller. Questa scelta oltre a causare problemi di ripetizione del codice, avrebbero reso i metodi del controller estremamente complessi.

Per questo si è deciso di implementare due repository, uno per tutte le operazioni che concernessero le scritture sul database, e uno per tutte le operazioni che riguardavano invece il retrieving dei dati dal database, e la mappatura di questi in oggetti del dominio.

Anche se sarebbe stato comunuque corretto avere un unico repository, in quanto mischiare tutte le operazioni sarebbe stato comunque aderente alla definizione del pattern, la scelta operata ha fornito alcuni vantaggi:
- Ha aumentato la leggibilità del codice, vista la verbosità dei metodi dei DAO implementati da Sequelize
- Ha permesso di bilanciare il carico di lavoro, avendo due oggetti che svolgessero due tipi di funzionalità diverse
- Ha aumentato la manutenibilità del codice, permettendo di verificare più velocemente la presenza di eventuali errori
- Ha facilitato l'implementazione dei controlli concernenti lo stato database, all'interno dei middleware

#### **Model-View-Controller**

Il pattern MVC divide l'architettura di un'applicazione in tre componenti chiave:
 - **Model**: è la parte dell'applicazione più vicina ai dati e a un eventuale strato di persistenza. Si occupa di gestire tutti i metodi che consentono di modificare i dati presenti nello schema di persistenza, e ottenere informazioni dal database.
 - **Controller**: il controller si occupa di gestire la logica del programma e di esaudire le richieste che l'utente fa attraverso la vista compiendo delle azioni. Tipicamente, ma non per forza, il controller riceve le richieste dell'utente, nel momento in cui queste sono state validate da un insieme di middleware appositi.
 - **View**: ottiene i dati del model per aggiornarsi, nel momento in cui ci sono cambiamenti, e si occupa di inviare le richieste dell'utente al controller.

Uno dei difetti più impotanti del pattern MVC è che il model e la view sono fortementi accoppiati. Quindi un qualsiasi cambiamento nella codebase del model implica un cambiamento nel codice della vista. Nel nostro caso avendo realizzato solo un backend, un'API, interrogabile mediante cURL o postman, questo problema non si pone.

Quindi, adottare l'MVC permette di ottenere un codice robusto e facilmente manutenibile. Oltretutto, l'MVC non richiede che il controller sia unico. Questo ha permesso di creare più controller, disaccopiando ulteriormente la logica e le azioni che dovevano essere eseguite, sulla base anche della loro semantica. 

 
## Utilizzo

### Prerequisiti
- Avere installato un ambiente docker sulla propria macchina
- Possibilità di eseguire comandi definiti in un Makefile

### Avviare l'applicazione
Prima di iniziare il processo di avvio è necessario clonare questo repository, e spostarsi nella cartella di progetto con il comando:
```
git clone https://github.com/S1107327/Progetto_PA_Sopranzetti_Tiseni.git
cd Progetto_PA_Sopranzetti_Tiseni
```
L'applicazione può essere avviata in due modalità: 
- Modalità DEV: utilizzata durante lo sviluppo.
- Modalità PRODUCTION: da utilizzare in fase di produzione per avviare l'applicazione compilata.

L'avvio dell'applicazione in modalità production avviene eseguendo i comandi presenti in un Makefile. Questi ultimi sono stati definiti in maniera tale che l'utente finale non dovesse eseguire comandi complessi da scrivere per avviare l'applicazione. Tali comandi sono disponibili solo in ambiente linux, perciò, nel caso in cui si volesse avviare l'applicazione in ambiente Windows, è possibile utilizzare i comandi alternativi riportati dopo i corrispondenti comandi make. Inoltre, poichè l'applicazione fa uso di una versione di openssl che non è ancora presente nei repository stabili di ubuntu, è necessario prima creare un'immagine docker locale in cui è installata una versione minimale di NodeJS e openssl 3.0.3. Tale immagine può essere creata con il comando:
```Shell
make openssl-build
```
o in alternativa su Windows:
```Shell
docker build -t node-openssl ./image
```
L'esecuzione di questo comando è molto lunga e impiega all'incirca 10-15 minuti a seconda delle potenzialità della macchina. Costruita l'immagine, a questo punto, è possibile avviare l'applicazione, in modalità production, operando in sequenza i due comandi:
```Shell
make build-prod
make up-prod
```
o in alternativa su windows:
```Shell
docker-compose -f docker-compose.prod.yaml build
docker-compose -f docker-compose.prod.yaml up
```
## Testing
Per facilitare il testing in fase di sviluppo e, per fornire a chi vuole iniziare a usare l'applicazione uno scenario pre-costituito, è possibile utilizzare la collection postman [PROGETTOPATEST](PROGETTOPATEST.postman_collection.json). Non tutte le richieste presenti nella collection hanno associati dei test, in quanto alcune servono solo a preparare lo scenario di test per altre richieste. Per poter eseguire lo scenario di test della collection è necessario importarla su postman cliccando su "Import"

![alt text](res-readme/postman_import.png)

e poi cliccando su "Upload Files" per scegliere la collection [PROGETTOPATEST](PROGETTOPATEST.postman_collection.json)

![alt text](res-readme/psotman_upload.png)

Successivamente, prima di iniziare i test, impostare la cartella "TestFiles", all'interno della cartella di progetto, come Working directory di postman, per permettergli di poter utilizzare i file al suo interno. Quindi cliccare sui tre puntini vicino al nome della collection e selezionare "Run Collection" nel menù a tendina aperto.

![alt text](res-readme/postman_collection.png)

Quindi, nella finestra che si apre, in cui è possibile settare le opzioni di esecuzione della collection, impostare Delay pari a 600 ms e spuntare la casella "Save Responses". Lasciare il resto delle opzioni con i valori predefiniti.

![alt text](res-readme/postman_run.png)

Infine per avviare i test cliccare su Run. La durata dei test è di circa tre minuti in quanto prima della richiesta "SignChallCodeExpired" è impostato un setTimeout di circa due minuti per dare tempo ai challenging codes di scadere e generare l'errore aspettato. Eseguiti i test con postman, è possibile eseguire una serie aggiuntiva di tre test utilizzando lo script [test.sh](test.sh). Questi test aggiuntivi vengono eseguiti con cURL da riga di comando perchè più complicati da eseguire con il client postman. Si prega di rendere il file [test.sh](test.sh) eseguibile con:
```Shell
chmod +x test.sh
```
e poi eseguire con
```Shell
./test.sh
```
Nel caso in cui si fosse in ambiente Windows, per eseguire la serie di tre test citata, è necessario utilizzare i comandi successivi, che dovranno avere come output, quello riportato subito dopo:

- KeyErrorTest
```Shell 
curl -X POST -F file=.\TestFiles\Diario_degli_esperimenti.pdf -s -w "\n%{http_code}\n" localhost:8080/sign/start -H "Accept: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJBZHJpYW5vIE1hbmNpbmkiLCJjb3VudHJ5TmFtZSI6IklUIiwic3RhdGVPclByb3ZpbmNlTmFtZSI6IkZNIiwibG9jYWxpdHlOYW1lIjoiRmVybW8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW9AbWFpbGluYXRvci5jb20iLCJzZXJpYWxOdW1iZXIiOiJNTkNEUk44MlQzMEQ1NDJVIiwiZG5RdWFsaWZpZXIiOiIyMDE3NTAwNzY5MyIsIlNOIjoiTWFuY2luaSIsInJvbGUiOiJ1c2VyIn0.PzK1TPpQSLF5cN1stO6hczyuQVG4v2Nq_XLqQizVGiY" 
```

che dovrebbe restituire:

```JSON
{"error":"Error! Form payload is incorrect"}
400
```

- DownloadSignerTest
```Shell
curl -O -J -s -w "%{http_code}\n" localhost:8080/download/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJMb3JlbnpvIFNvcHJhbnpldHRpIiwiY291bnRyeU5hbWUiOiJJVCIsInN0YXRlT3JQcm92aW5jZU5hbWUiOiJBTiIsImxvY2FsaXR5TmFtZSI6IkZpbG90dHJhbm8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW8xQG1haWxpbmF0b3IuY29tIiwic2VyaWFsTnVtYmVyIjoiTFNQRFJOOTRUMzBENTQyVSIsImRuUXVhbGlmaWVyIjoiMjAxNzUwMDc2OTMiLCJTTiI6IlNvcHJhbnpldHRpIiwicm9sZSI6InVzZXIifQ.mAdEhfnLfGdlDSHiaz7X1dzDd1P-qvj9e82itMRGyro"
```

che dovrebbe scaricare il file .p7m nella cartella attuale e restituire il codice 200. Per eseguire l'ultimo test eliminare il file appena scaricato.

- DownloadApplicantTest
```Shell
curl -O -J -s -w "%{http_code}\n" localhost:8080/download/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJBZHJpYW5vIE1hbmNpbmkiLCJjb3VudHJ5TmFtZSI6IklUIiwic3RhdGVPclByb3ZpbmNlTmFtZSI6IkZNIiwibG9jYWxpdHlOYW1lIjoiRmVybW8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW9AbWFpbGluYXRvci5jb20iLCJzZXJpYWxOdW1iZXIiOiJNTkNEUk44MlQzMEQ1NDJVIiwiZG5RdWFsaWZpZXIiOiIyMDE3NTAwNzY5MyIsIlNOIjoiTWFuY2luaSIsInJvbGUiOiJ1c2VyIn0.PzK1TPpQSLF5cN1stO6hczyuQVG4v2Nq_XLqQizVGiY"
```

che dovrebbe scaricare il file .p7m nella cartella attuale e restituire il codice 200.

Come nota finale si prega di fare tutti i test citati, solo dopo il primo avvio dell'applicazione.

## Note di sviluppo

Nello sviluppo dell'applicazione si sono utilizzati i seguenti software:
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/)
- [cURL](https://curl.se/)
- [Postman](https://www.postman.com/)

Una peculiarità del progetto presentato è la separazione stretta tra applicazione di produzione a applicazione di sviluppo. Dividere in maniera attenta le due fasi ha permesso uno sviluppo più agevole e rapido del progetto e del codice. In particolare, una tecnologia di rilievo è stata [nodemon](https://www.npmjs.com/package/nodemon), un pacchetto di NodeJS che in fase di sviluppo ha permesso di lavorare con "Hot Reload". Montando come volume nel container la cartella contenente il codice sorgente in typescript, si poteva indicare a nodemon di "osservare" quella cartella, configurando il file [nodemon.json](nodemon.json). In questa maniera, non appena vengono apportati e salvati cambiamenti sul codice, nodemon fa ripartire l'applicazione rendendo i cambiamenti subito operativi. Ciò ha evitato di dover rifare il processo di build ad ogni cambiamento nel codice, velocizzando notevolmente lo sviluppo. La build si rendeva quindi necessaria solo nel momento in cui ci fossero stati cambiamenti nello strato di persistenza del database oppure, all'aggiunta o modifica di file nella cartella di progetto.

Si vuole inoltre sottolineare che, nel caso in cui si volessero generare nuovi token JWT, la chiave da utilizzare è: chiavesegretissimaperiltokenjwtp.

## Autori
- Sopranzetti Lorenzo [github](https://github.com/lorenzo8743)
- Tiseni Lorenzo [github](https://github.com/S1107327)

