import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload }  from "jsonwebtoken";
import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";
import { repository } from "../database/Models/repository";
import config from "../config";

/**
 * Controlla che l'header della richiesta possieda le autorizzazioni
 * 
 * @param req: contiene la richiesta arrivata dal client
 * @param res: contiene la risposta del sercer
 * @param next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkHeader = (req:any, res: Response, next: NextFunction): void => {
    const autheader = req.headers.authorization;
    autheader ? next() : next(errorFactory.getError(ErrEnum.MissingAuthHeader));
}


/**
 * Funzione che controlla che siano presenti le autorizzazioni nell'header e recupera il token da esso
 * 
 * @param req: contiene la richiesta arrivata dal client
 * @param res: contiene la risposta del sercer
 * @param next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkToken = (req: any,res: Response ,next: NextFunction): void  => {
    const bearerHeader = req.headers.authorization;
    if(typeof bearerHeader!=='undefined'){
        const bearerToken = bearerHeader.split(' ')[1];
        req.token=bearerToken;
        next();
    }else{
        next(errorFactory.getError(ErrEnum.Forbidden));
    }
}


/**
 * Funzione che verifica l'autenticazione tramite token JWT
 * 
 * @param req: contiene la richiesta arrivata dal client
 * @param res: contiene la risposta del sercer
 * @param next: funzione che contiene il riferimento al prossimo middleware
 */
export const verifyAndAuthenticate = (req:any, res: Response, next: NextFunction): void => {
    try{
        let decoded = jwt.verify(req.token, config.JWT_KEY);
        if(decoded !== null){
            req.user = decoded;
            next();
        } else {
            next(errorFactory.getError(ErrEnum.JWTVerifyError));
        }
    }catch{
        next(errorFactory.getError(ErrEnum.JWTVerifyError));
    }
}

/**
 * Funzione che controlla la formattazione nei campi del payload del JWT
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export function checkJWTPayload (req: any, res: Response, next: NextFunction): void {
    const variableLengthRg: RegExp = /^[a-zA-Z" "]+$/;
    const codiceFiscaleRg: RegExp = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;
    const emailAddressRg: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const countyStateProvinceRg: RegExp = /^[a-zA-Z]{2}$/; 

    try{    
        let commonNameVal: boolean = variableLengthRg.test(req.user.commonName);
        let countryName: boolean = countyStateProvinceRg.test(req.user.countryName);
        let stateOrProvinceName: boolean = countyStateProvinceRg.test(req.user.stateOrProvinceName);
        let localityName: boolean = variableLengthRg.test(req.user.localityName);
        let organizationName: boolean = variableLengthRg.test(req.user.organizationName);
        let organizationalUnitName: boolean = variableLengthRg.test(req.user.organizationalUnitName);
        let emailAddress: boolean = emailAddressRg.test(req.user.emailAddress);
        let serialNumber: boolean = codiceFiscaleRg.test(req.user.serialNumber);
        let SN: boolean = variableLengthRg.test(req.user.SN);

        if (commonNameVal && countryName && stateOrProvinceName && localityName && organizationName && organizationalUnitName && emailAddress && serialNumber && SN){
            next();
        }else{
            next(errorFactory.getError(ErrEnum.InvalidJWTPayload));
        }
    }catch{
        next(errorFactory.getError(ErrEnum.InvalidJWTPayload));
    }
}

/**
 * Funzione che controlla se i dati nel payload del token JWT sono conformi ai dati
 * degli utenti nel database
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export function checkUserAuthJWT (req: any, res: Response, next: NextFunction): void {
    const repo = new repository();
    repo.getUser(req.user.serialNumber).then((result) => {
        (result !== null) ? next() : next(errorFactory.getError(ErrEnum.UnregisteredUser));
    })
    
}


export const JWT_certificate_creation = checkJWTPayload;