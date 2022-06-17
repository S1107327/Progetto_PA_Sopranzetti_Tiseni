
import { NextFunction } from "express";
import { readRepository } from "../database/Models/readRepository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import handler from "express-async-handler";


const repo:readRepository = new readRepository();

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
            if (result === null)
                next(errorFactory.getError(ErrEnum.UnregisteredUser))
        }
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser));
    }
    next();
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
    next()
})

export const CriticalsAsyncMW = [checkUserAuthJWT]