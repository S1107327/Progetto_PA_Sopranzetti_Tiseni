import { repository } from "../database/Models/repository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { NextFunction, Request, Response } from "express";
import { upload } from '../utils/multer-config';
import { checkForm_Data } from "./mw-async-db";

const repo = new repository();

export const checkPayload = (req: Request, res: Response, next: NextFunction): void => {
    try {
        req.body = JSON.parse(req.body)
        next()
    } catch (error) {
        next(errorFactory.getError(ErrEnum.InvalidJSONPayload))
    }
}

//TODO: pensare alle validazioni da fare quando si sapranno quali sono i payload json

//Validazione per la rotta che avvia il processo di firma e carica il documento

/**
 * Funzione che controlla se nell'header è presente l'id del documento da utilizzare per i processi di firma
 * e varie altre funzionalità che richiedono l'id del documento
 * @param req 
 * @param res 
 * @param next 
 */
export function checkHeader(req: any, res:any, next:NextFunction){
    if(req.headers.id !== undefined) 
        next()
    else
        next(errorFactory.getError(ErrEnum.InvalidHeader))
}

export const signProcessMW = [upload.single('document'), checkForm_Data]



