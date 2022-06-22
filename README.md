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
- In generale, il token JWT utilizzato per utenticare tutte le richieste è sempre il medesimo e e contiene un payload JSON con i seguenti campi:

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

  Per gli utenti admin nel camo role ci sarà scritto "admin" invece che "user".

- Nel momento in cui si verifica il numero di token di un utente, ovvero quando esso chiede di avviare un nuovo processo di firma, nel conteggio si fa riferimento anche al numero di token "impegnati" dell'utente. Ovvero quei token che l'utente potrebbe utilizzare in futuro qualora dei processi di firma che esso aveva già avviato andassero a buon fien. Questo serve ad evitare che un utente possa avviare più processi di firma di quanti se ne può effittavamente permettere una volta che saranno completati.
 
- Per ogni utente, nel caso di firma multipla, viene utilizzata sempre la stessa PEMPASSPHRASE, ovvero la stessa password. Questo viene fatto perché openssl non prevede un comando che consenta di inserire più password nel caso di firme multiple.


## Progettazione

### Diagramma dei casi d'uso

### Rotte
La definizione delle rotte è stata fatta seguendo tutte le richieste e le necessità definite nelle specifiche di progetto. In particolare, le rotte dell'applicazione sono:

| Rotta        | Metodo | Caso d'uso  |
| ------------- | ------------- | ----- |
| / | GET | benvenuto |
| /create | GET | creazione del certificato |
| /invalidate | GET | invalidazione di un certificato |
| /credit | GET | visualizzazione del credito |
| /download/:id | GET | download di un documento tramite il suo id |
| /sign/start | POST | iniziare un processo di firma |
| /sign/cancel/:id | GET | cancellare un processo di firma |
| /sign/status/:id | GET | recupera lo stato di un processo di firma |
| /sign/getchallnumbers | GET | ottenere i challenging codes |
| /sign/:id | POST | firmare un documento indicandone l'id |

DESCRIZIONE DI COSA FA LA ROTTA E COSA RITORNA

### Diagramma delle classi

### Diagrammi delle sequenza

PER OGNI DIAGRAMMA SI SPIEGA COSA ACCADE E QUALI CONTROLLI SI SONO IMPLEMENTATI IN OGNI MIDDLEWARE

COSA FA IL CONTROLLER

### Pattern

## Utilizzo

### Prerequisiti

### Setup (non so se serve)

### Avviare l'applicazione

## Testing

TEST CON COLLEZIONE POSTMAN
METODO PER TESTARE DOWNLOAD DEL FILE 


