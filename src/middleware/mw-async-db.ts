
import { NextFunction } from "express";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import handler from "express-async-handler";
import crypto from "crypto"
import { readFileSync } from "fs";
import { readRepository } from "../database/Models/readRepository";
import { Document } from "../database/Models/DAOs/documentDAO";
import { upload } from "../utils/multer-config";
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
        let signers: Array<string> = req.body.firmatari;
        console.log(req.body.firmatari);
        for (let i = 0; i<signers.length; i++){
            let result = await readRepo.getUser(signers[i]);
            if (result === null){
                next(errorFactory.getError(ErrEnum.UnregisteredUser))
            }
            else if (i === signers.length-1 && result != null){
                next()
            }
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
    try {
        let textBody: any = req.body;
        let srcDocument: any = req.file;
        let srcDocumentBuffer: Buffer = readFileSync(srcDocument.path);
        let fileHash = crypto.createHash('sha256').update(`${srcDocumentBuffer}${textBody.firmatari.join['']}`).digest('hex');
        req.fileHash = fileHash;
        let result: Document | null = await readRepo.getDocumentByHash(fileHash);
        if (result === null)
            next();
        if (result !== null){
                next(errorFactory.getError(ErrEnum.FileAlreadyExistError));
        }
    } catch (error) {
        next(errorFactory.getError(ErrEnum.GenericError))
    }
});

export const checkIfApplicant = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let codice_fiscale: string = req.user.serialNumber;
    let documentId:number = req.params.id
    let document: Document | null = await readRepo.getDocument(documentId);
    if (document !== null){
        if (document.codice_fiscale_richiedente === codice_fiscale){
            next()
        }else{
            next(errorFactory.getError(ErrEnum.Forbidden))
        }
    }else{
        next(errorFactory.getError(ErrEnum.InvalidParams))
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
    if(signers !== null){
        let signer: SignProcess[] = signers?.filter(signer => signer.codice_fiscale_firmatario === req.user.serialNumber);
        if(signer.length >= 1){
            if(!signer[0].stato){
                next();
            }else{
                next(errorFactory.getError(ErrEnum.SignAlreadyDone));
            }
        }else{
            next(errorFactory.getError(ErrEnum.SignerNotAdmitted));
        }
    }else{
        next(errorFactory.getError(ErrEnum.InvalidFormPayload));
    }
});

export const checkChallString = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let challstrings: string[] | null = await readRepo.getChallengingStrings(req.user.serialNumber);
    if(challstrings !== null){
        console.log(challstrings);
        console.log(req.body.codes);
        if(challstrings.length === req.body.codes.length && 
            challstrings.every((val, i) => val === req.body.codes[i])){
            next();
        }else{
            next(errorFactory.getError(ErrEnum.BadChallengingString));
        }
    }else{
        next(errorFactory.getError(ErrEnum.GenericError));
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
        next(errorFactory.getError(ErrEnum.GenericError));
    }
});

export const checkIfCompleted = handler(async (req: any, res: any, next: NextFunction) => {
    try{
        let signProcessId = req.params.id;
        let document: Document | null = await readRepo.getDocument(signProcessId);
        if (document !== null && document.stato_firma){
            //TODO: cambiare errore con uno più specifico
            next(errorFactory.getError(ErrEnum.GenericError));
        } else if (document !== null){
            next()
        } else {
            next(errorFactory.getError(ErrEnum.InvalidId));
        }
    }catch{
        next(errorFactory.getError(ErrEnum.GenericError));
    }
});

export const signProcessMW = [upload.single('document'), checkForm_Data, checkIfAlreadyExistOrSigned];
