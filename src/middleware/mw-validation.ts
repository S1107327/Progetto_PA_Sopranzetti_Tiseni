import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { NextFunction, Request, Response } from "express";
import * as fs from 'fs';
import path from "path";

/**
 * Middleware che controlla l'esistenza della rotta desisderata'
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const RouteNotFound = (req: Request, res: Response, next: NextFunction): void => {
    next(errorFactory.getError(ErrEnum.RouteNotFound));
}

/**
 * Middleware che controlla la corretta formattazione del payload JSON
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkPayload = (req: Request, res: Response, next: NextFunction): void => {
    try {
        req.body = JSON.parse(req.body);
        next();
    } catch (error) {
        next(errorFactory.getError(ErrEnum.InvalidJSONPayload));
    }
};

/**
 * Middleware che controlla se un certificato associato a un determinato utente già esiste, 
 * il middleware manda avanti la catena di esecuzione dei middleware se il certificato 
 * non esiste
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
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
};

/**
 * Middleware che controlla se un certificato associato a un determinato utente già esiste,
 * il middleware manda avanti la catena di esecuzione dei middleware se il certificato esiste
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkCertificateNotExists = (req: any, res: Response, next: NextFunction): void => {
    fs.readdir(path.resolve(__dirname, `../../certificati`), function (err, files) {
        if (err) {
            next(errorFactory.getError(ErrEnum.GenericError));
        }
        if(files.includes(`${req.user.serialNumber}.crt`)){
            next();
        }
        else{
            next(errorFactory.getError(ErrEnum.CertificateNotFound));
        }
    });
};

/**
 * Middleware che controlla se l'email specificata nel body della richiesta sia una mail valida
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkUserEmail = (req: any, res: Response, next: NextFunction): void => {
    let email: string = req.body.email;
    const emailAddressRg: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let emailAddress: boolean = emailAddressRg.test(email);
    if(emailAddress){
        next();
    }else{
        next(errorFactory.getError(ErrEnum.ValidationError));
    }
}

/**
 * Middleware che controlla se il numero di token specificati nel body della richiesta sia un 
 * numero valido, ovvero un intero positivo
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkTokenNumber = (req: any, res: Response, next: NextFunction): void => {
    if(req.body.nToken !== undefined && Number.isInteger(Number(req.body.nToken)) && req.body.nToken > 0){
        next();
    }else{
        next(errorFactory.getError(ErrEnum.InvalidTokenNumber));
    }
}

/**
 * Middleware che controlla se il payload JSON per l'inserimento dei challenging codes sia 
 * correttamente formattato
 * @param {any} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export const checkChallJSONBody = (req: any, res: Response, next: NextFunction): void => {
    if(req.body.codes !== undefined && Array.isArray(req.body.codes) && req.body.codes.length === 2)
        next();
    else
        next(errorFactory.getError(ErrEnum.NoChallCodes));
}



