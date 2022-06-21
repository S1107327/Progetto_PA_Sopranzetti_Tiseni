import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";
import config from "../config";


/**
 * Controlla che l'header della richiesta possieda le autorizzazioni
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkHeader = (req:any, res: Response, next: NextFunction): void => {
    const autheader = req.headers.authorization;
    autheader ? next() : next(errorFactory.getError(ErrEnum.MissingAuthHeader))
}


/**
 * Controlla che l'autenticazione sia fatta con un bearer token
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {Response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkToken = (req: any,res: Response ,next: NextFunction): void  => {
    const bearerHeader = req.headers.authorization;
    if(bearerHeader.split(' ')[0] === 'Bearer'){
        const bearerToken = bearerHeader.split(' ')[1];
        req.token=bearerToken;
        next();
    }else{
        next(errorFactory.getError(ErrEnum.WrongAuthHeader));
    }
}


/**
 * Verifica l'autenticazione tramite token JWT
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {Response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
 */
export const verifyAndAuthenticate = (req:any, res: Response, next: NextFunction): void => {
    try{
        if (config.JWT_KEY !== undefined){
            let decoded = jwt.verify(req.token, config.JWT_KEY);
            if(decoded !== null){
                req.user = decoded;
                next();
            } else {
                next(errorFactory.getError(ErrEnum.JWTVerifyError));
            }
        }
    }catch{
        next(errorFactory.getError(ErrEnum.JWTVerifyError));
    }
};

/**
 * Verifica che il token JWT non sia scaduto
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {Response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkJWTExpiration = (req:any, res:Response, next: NextFunction): void => {
    if(Date.now() < req.user.exp*1000){
        next();
    }
    else{
        next(errorFactory.getError(ErrEnum.JWTExpired));
    }
};

/**
 * Controlla la formattazione nei campi del payload del JWT
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {Response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
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
        let role: boolean = ['user', 'admin'].includes(req.user.role) ? true : false;

        if (commonNameVal && countryName && stateOrProvinceName && localityName && organizationName && organizationalUnitName && emailAddress && serialNumber && SN && role){
            next();
        }else{
            next(errorFactory.getError(ErrEnum.InvalidJWTPayload));
        }
    }catch{
        next(errorFactory.getError(ErrEnum.InvalidJWTPayload));
    }
}

/**
 * Verifica che il ruolo presente nel token JWT sia admin
 * 
 * @param {any} req: contiene la richiesta arrivata dal client
 * @param {Response} res: contiene la risposta del sercer
 * @param {NextFunction} next: funzione che contiene il riferimento al prossimo middleware
 */
 export const checkIfAdmin = (req:any, res:Response, next: NextFunction): void => {
    if(req.user.role === 'admin'){
        next();
    }
    else{
        next(errorFactory.getError(ErrEnum.Forbidden));
    }
};