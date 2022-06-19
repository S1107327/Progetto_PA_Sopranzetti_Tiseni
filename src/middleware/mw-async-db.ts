
import { NextFunction } from "express";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import handler from "express-async-handler";
import crypto from "crypto"
import { readFileSync } from "fs";
import { readRepository } from "../database/Models/readRepository";
import { Document } from "../database/Models/DAOs/documentDAO";
import { SignProcess } from "../database/Models/DAOs/signProcessDAO";

const readRepo: readRepository = readRepository.getRepo();

/**
 * Funzione che controlla se gli utenti firmatari inseriri sono utenti registrati
 * @param req 
 * @param res 
 * @param next 
 */
export const checkForm_Data = handler(async (req: any, _res: any, next: NextFunction): Promise<void> => {
    try{
        if(req.file !== undefined && req.body.firmatari.lenght === new Set(req.body.firmatari).size){
            let signers: Array<string> = req.body.firmatari;
            for (let i = 0; i<signers.length; i++){
                let result = await readRepo.getUser(signers[i]);
                if (result === null){
                    next(errorFactory.getError(ErrEnum.UnregisteredUser))
                }
                else if (i === signers.length-1 && result != null){
                    next()
                }
            }
    }else{
        next(errorFactory.getError(ErrEnum.InvalidFormPayload));
    }
    }catch (err){
        next(errorFactory.getError(ErrEnum.InvalidFormPayload));
    }
});

/**
 * Funzione che controlla se i dati nel payload del token JWT sono conformi ai dati
 * degli utenti nel database
 * 
 * @param req 
 * @param res 
 * @param next 
 */

export const checkUserAuthJWT = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    try{
        let result = await readRepo.getUser(req.user.serialNumber);
            if(result !== null) 
                next();
            else
                next(errorFactory.getError(ErrEnum.UnregisteredUser));
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser));
    }
});

/**
 * Funzione che controlla se il documento di cui è stata richiesta la firma già esiste nel database e 
 * quindi è stato firmato dagli stessi firmatari in passato, perciò non può più essere firmato
 * 
 * @param req 
 * @param res 
 * @param next 
 * 
 */


export const checkIfAlreadyExistOrSigned = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    //Non serve un generic error perché se c'è un qualsiasi errore diverso da quelli previsti (ad esempio durante la lettura) viene resistuito un errore
    //di tipo genericError di default dalla factory
    let textBody: any = req.body;
    let srcDocument: any = req.file;
    let srcDocumentBuffer: Buffer = readFileSync(srcDocument.path);
    let fileHash = crypto.createHash('sha256').update(`${srcDocumentBuffer}${textBody.firmatari.join('')}`).digest('hex');
    console.log(textBody.firmatari.join(''))
    req.fileHash = fileHash;
    let result: Document | null = await readRepo.getDocumentByHash(fileHash);
    if (result === null)
        next();
    if (result !== null){
        next(errorFactory.getError(ErrEnum.FileAlreadyExistError));
    }
});

export const checkIfApplicant = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let codice_fiscale: string = req.user.serialNumber;
    let documentId:number = req.params.id
    let document: Document | null = await readRepo.getDocument(documentId);
    //document non può essere null perché controllato il checkId
    if (document!.codice_fiscale_richiedente === codice_fiscale){
        next()
    }else{
        next(errorFactory.getError(ErrEnum.Forbidden))
    }
});

export const checkIfSignerOrApplicant = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let codice_fiscale: string = req.user.serialNumber;
    let documentId:number = req.params.id;
    let document: Document | null = await readRepo.getDocument(documentId);
    let signers: SignProcess[] | null = await readRepo.getSignerById(documentId);
    let filtered: SignProcess[] = signers!.filter((elem) => elem.codice_fiscale_firmatario === codice_fiscale);
    if (document!.codice_fiscale_richiedente === codice_fiscale){
        next();
    }else if(filtered.length === 1){
        next();
    }
    else{
        next(errorFactory.getError(ErrEnum.Forbidden))
    }
});


/**
 * Funzione che controlla se nell'header è presente l'id del documento da utilizzare per i processi di firma
 * e varie altre funzionalità che richiedono l'id del documento
 * @param req 
 * @param res 
 * @param next 
 */
 export const checkId = handler(async (req: any, res:any, next:NextFunction): Promise<void> => {
    if(req.params.id !== undefined && Number.isInteger(Number(req.params.id)) && req.params.id > 0){
        req.params.id = Number(req.params.id);
        let document: Document | null = await readRepo.getDocument(req.params.id);
        if (document !== null){
            next()
        }else{
            next(errorFactory.getError(ErrEnum.InvalidId));
        }
    }
    else
        next(errorFactory.getError(ErrEnum.InvalidParams));
});

export const checkSigner = handler(async (req:any, res:any, next:NextFunction): Promise<void> => {
    let signers: SignProcess[] | null = await readRepo.getSignerById(req.params.id);
    //Signers non può essere null perché in checkId si controlla che il documento esiste e secondo checkForm_Data non si può creare 
    //un document senza nemmeno un signer valido
    let signer: SignProcess[] = signers!.filter(signer => signer.codice_fiscale_firmatario === req.user.serialNumber);
    if(signer.length === 1){
        if(!signer[0].stato){
            next();
        }else{
            next(errorFactory.getError(ErrEnum.SignAlreadyDone));
        }
    }else{
        next(errorFactory.getError(ErrEnum.SignerNotAdmitted));
    }
});

export const checkChallString = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let challstrings: string[] | null = await readRepo.getChallengingStrings(req.user.serialNumber);
    if(challstrings!.length === req.body.codes.length && 
        challstrings!.every((val, i) => val === req.body.codes[i])){
        next();
    }else{
        next(errorFactory.getError(ErrEnum.BadChallengingString));
    }
});

export const checkExpiration = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let exp: Date | null = await readRepo.getChallCodeExp(req.user.serialNumber);
    if(exp !== null){
        if(new Date(Date.now()) < exp){
            next();
        }
        else{
            next(errorFactory.getError(ErrEnum.ChallengingCodeExpired));
        }
    }else{
        //TODO: Cambiare errore: l'errore si ha solo quando l'utente non ha mai chiesto challenging code prima
        next(errorFactory.getError(ErrEnum.GenericError));
    }
});

export const checkIfCompleted = handler(async (req: any, res: any, next: NextFunction) => {
        let signProcessId = req.params.id;
        let document: Document | null = await readRepo.getDocument(signProcessId);
        //Documento non può essere null perché controllato in checkId
        if (document!.stato_firma)
            next(errorFactory.getError(ErrEnum.CannotCancel));
        else
            next()
});


export const checkIfUserEmailExist = handler(async (req:any, res:any, next: NextFunction): Promise<void> => {
    let email = req.body.email;
    let user = await readRepo.getUserByEmail(email);
    if (user !== null){
        next();
    }
    else{
        next(errorFactory.getError(ErrEnum.InvalidEmail));
    }
})


export const checkIfSigned = handler(async (req: any, res: any, next: NextFunction) => {
    let signProcessId = req.params.id;
    let document: Document | null = await readRepo.getDocument(signProcessId);
    if (document!.stato_firma)
        next()
    else
        next(errorFactory.getError(ErrEnum.DocumentNotSigned));
});

export const checkTokenQty = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    //user non può essere null perchè controllato durante l'autenticazione con JWT
    let user = await readRepo.getUser(req.user.serialNumber);
    //req.body.firmatari non può essere null o undefined perché controllato in checkForma_Data
    let signers_number = req.body.firmatari.length;
    let tokenToBeSpent:number  = await readRepo.getTokenToBeConsumed(user!.codice_fiscale)
    if (user!.numero_token - tokenToBeSpent >= signers_number){
        next();
    }else{
        next(errorFactory.getError(ErrEnum.NotEnoughToken))
    }
})
