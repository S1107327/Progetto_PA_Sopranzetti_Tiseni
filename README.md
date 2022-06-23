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
- Modalità BUILD: da utilizzare in fase di produzione per avviare l'applicazione compilata.

L'avvio dell'applicazione in modalità build avviene eseguendo i comandi presenti in un Makefile. Questi ultimi sono stati definiti in maniera tale che l'utente finale non dovesse eseguire comandi complessi da scrivere per avviare l'applicazione. Inoltre, poichè l'applicazione fa uso di una versione di openssl che non è ancora presente nei repository stabili di ubuntu, è necessario prima creare un'immagine docker locale in cui è installata una versione minimale di NodeJS e openssl 3.0.3. Tale immagine può essere creata con il comando:
```Shell
make openssl-build
```
L'esecuzione di questo comando è molto lunga e impiega all'incirca 10-15 minuti a seconda delle potenzialità della macchina. Costruita l'immagine a questo punto è possibile avviare l'applicazione operando in sequenza i due comandi:
```Shell
make build-prod
make up-prod
```
## Testing
Per facilitare il testing in fase di sviluppo e per fornire a chi vuole iniziare a usare l'applicazione uno scenario pre-costituito è possibile utilizzare la collection postman [PROGETTOPATEST](PROGETTOPATEST.postman_collection.json). Non tutte le richieste presenti nella collection hannno associati dei test, in quanto alcune servono solo a preparare lo scenario di test di altre richieste. Per poter eseguire lo scenario di test della collection è necessario importare la collection su postman cliccando su "Import"
![alt text](res-readme/postman_import.png)

e poi cliccando su "Upload Files" per scegliere la collection [PROGETTOPATEST](PROGETTOPATEST.postman_collection.json)

![alt text](res-readme/psotman_upload.png)

Successivamente cliccare sui tre puntini vicino al nome della collection e selezionare "Run Collection" nel menù a tendina aperto.

![alt text](res-readme/postman_collection.png)

Quindi nella finestra che si apre, in cui è possibile settare le opzioni di esecuzione della collection, impostare Delay pari a 600 ms e spuntare la casella "Save Responses". Lasciare il resto delle opzioni con i valori predefiniti.

![alt text](res-readme/postman_run.png)

Infine per avviare i test cliccare su Run. La durata dei test è di circa tre minuti in quanto prima della richiesta "SignChallCodeExpired" è impostato un setTimeout di circa due minuti per dare tempo ai challenging codes di scadere e generare l'errore aspettato. Eseguiti i test con postman, è possibile eseguire una serie aggiuntiva di tre test eseguendo il file [test.sh](test.sh). Questi test aggiuntivi vengono eseguiti con cURL da riga di comando perchè più complicati da eseguire con il client postman. Si prega di rendere il file [test.sh](test.sh) eseguibile con:
```Shell
chmod +x test.sh
```
e poi eseguire con
```Shell
./test.sh
```
Come nota finale si prega di eseguire tutti i test citati, solo dopo il primo avvio dell'applicazione.

## Note di sviluppo



