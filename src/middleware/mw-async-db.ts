
import { NextFunction } from "express";
import { repository } from "../database/Models/repository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";

const repo:repository = new repository();


/**
 * Funzione che controlla se gli utenti firmatari inseriri sono utenti registrati
 * @param req 
 * @param res 
 * @param next 
 */

export async function checkForm_Data (req: any, res: any, next: NextFunction): Promise<void>{
    try{
        let signers: Array<string> = req.body.firmatari;
        for (let i = 0; i<signers.length; i++){
            let result = await repo.getUser(signers[i]);
            if (result === null)
                throw new Error()
        }
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser));
    }
    next();
}
/*
export async function checkForm_Data (req: any, res: any, next: NextFunction): Promise<void>{
    try{
        let signers: Array<string> = req.body.firmatari;
        for (let i = 0; i<signers.length; i++){
            repo.getUser(signers[i]).then((result) => {
            if (result === null)
                next(errorFactory.getError(ErrEnum.UnregisteredUser))
            })
        }
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser));
    }
    next();
}
*/
/**
 * Funzione che controlla se i dati nel payload del token JWT sono conformi ai dati
 * degli utenti nel database
 * 
 * @param req 
 * @param res 
 * @param next 
 */
/*
export async function checkUserAuthJWT (req: any, res: Response, next: NextFunction): Promise<void> {
    try{
        const repo = new repository();
        let result = await repo.getUser(req.user.serialNumber)
            if(result !== null) 
                next()
            else
                throw new Error();
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser))
    }
    
}
*/
export function checkUserAuthJWT (req: any, res: Response, next: NextFunction): void{
    try{
        const repo = new repository();
        repo.getUser(req.user.serialNumber).then((result) => {
            if(result !== null) 
                next()
            else
                next(errorFactory.getError(ErrEnum.UnregisteredUser))
        })
    }catch (err){
        next(errorFactory.getError(ErrEnum.UnregisteredUser))
    }
    
}