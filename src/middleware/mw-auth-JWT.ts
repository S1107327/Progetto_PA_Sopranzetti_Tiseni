import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";

export const checkHeader = (req:any, res: Response, next: NextFunction): void => {
    const autheader = req.headers.authorization;
    autheader ? next() : next(errorFactory.getError(ErrEnum.MissingAuthHeader))
}


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

