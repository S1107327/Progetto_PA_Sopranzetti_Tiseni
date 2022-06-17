
import { NextFunction } from "express";
import { repository } from "../database/Models/repository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import handler from "express-async-handler";
import crypto from "crypto"
import { readFileSync } from "fs";


const repo:repository = new repository();

/**
 * Funzione che controlla se gli utenti firmatari inseriri sono utenti registrati
 * @param req 
 * @param res 
 * @param next 
 */

export const checkForm_Data = handler(async (req: any, _res: any, next: NextFunction): Promise<void> => {
    try{
        let signers: Array<string> = req.body.firmatari;
        for (let i = 0; i<signers.length; i++){
            let result = await repo.getUser(signers[i]);
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
})

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
        let result = await repo.getUser(req.user.serialNumber)
            if(result !== null) 
                next()
            else
                next(errorFactory.getError(ErrEnum.UnregisteredUser))
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser))
    }
})

export const CriticalsAsyncMW = [checkUserAuthJWT]

/**
 * Funzione che controlla se il documento di cui è stata richiesta la firma già esiste nel database e 
 * quindi è stato firmato dagli stessi firmatari in passato, perciò non può più essere firmato
 * 
 * @param req 
 * @param res 
 * @param next 
 * 
 */

/*
export const checkIfAlreadySigned = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    try {
        let textBody: any = req.body;
        let srcDocument: any = req.file;
        let srcDocumentBuffer: Buffer = readFileSync(srcDocument.path)
        let fileHash = crypto.createHash('sha256').update(`${srcDocumentBuffer}${textBody.firmatari.join['']}`).digest('hex');
        req.fileHash = fileHash
        let result = await repo.getDocument(fileHash)
        if (result === null)
            next()
        if (result !== null)
            next(errorFactory.getError(ErrEnum.FileAlreadyExistError))
    } catch (error) {
        next(errorFactory.getError(ErrEnum.NotFound))
    }
})
*/

export const checkIfApllicant = handler(async (req: any, res: any, next: NextFunction): Promise<void> => {
    let codice_fiscale: string = req.user.serialNumber;
    let documentId:number = req.headers
//    let isApplicant: boolean = await repo.
})