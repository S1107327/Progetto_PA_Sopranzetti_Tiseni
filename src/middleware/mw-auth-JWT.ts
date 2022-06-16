import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";

/**
 * Controlla che l'header della richiesta possieda le autorizzazioni
 * 
 * @param req: contiene la richiesta arrivata dal client
 * @param res: contiene la risposta del sercer
 * @param next: funzione che contiene il riferimento al prossimo middleware
 */
export const checkHeader = (req:any, res: Response, next: NextFunction): void => {
    const autheader = req.headers.authorization;
    autheader ? next() : next(errorFactory.getError(ErrEnum.MissingAuthHeader))
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
    if (process.env.JWT_KEY !== undefined){
        let decoded = jwt.verify(req.token, process.env.JWT_KEY);
        if(decoded !== null){
            req.user = decoded;
            next();
        } else {
            next(errorFactory.getError(ErrEnum.JWTVerifyError))
        }
    }
}

