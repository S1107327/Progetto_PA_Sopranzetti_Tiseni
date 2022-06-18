import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { NextFunction, Request, Response } from "express";
import * as fs from 'fs';
import path from "path";

export const checkPayload = (req: Request, res: Response, next: NextFunction): void => {
    try {
        req.body = JSON.parse(req.body)
        next()
    } catch (error) {
        next(errorFactory.getError(ErrEnum.InvalidJSONPayload))
    }
}

export const checkCertificateAlreadyExist = (req: any, res: Response, next: NextFunction): void => {
    fs.readdir(path.resolve(__dirname, `../../certificati`), function (err, files) {
        if (err) {
            next(errorFactory.getError(ErrEnum.CertCreationError));
        }
        if(files.includes(`${req.user.serialNumber}.crt`)){
            next(errorFactory.getError(ErrEnum.CertAlreadyExistErr));
        }
        else{
            next();
        }
    });
}

//TODO: pensare alle validazioni da fare quando si sapranno quali sono i payload json

//Validazione per la rotta che avvia il processo di firma e carica il documento



