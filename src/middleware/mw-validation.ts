import { repository } from "../database/Models/repository";
import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { NextFunction, Request, Response } from "express";
import { upload } from '../multer-config';
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


export const signProcessMW = [upload.single('document'), checkForm_Data]


