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
};

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

export const checkCertificateNotExists = (req: any, res: Response, next: NextFunction): void => {
    console.log(req.user)
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

export const checkCertificateExistance = (req: any, res: Response, next: NextFunction): void => {
    fs.readdir(path.resolve(__dirname, `../../certificati`), function (err, files) {
        if (err) {
            next(errorFactory.getError(ErrEnum.GenericError));
        }
        if(!(files.includes(`${req.user.serialNumber}.crt`))){
            next(errorFactory.getError(ErrEnum.CertificateNotFound));
        }
        else{
            next();
        }
    });
};

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

export const checkTokenNumber = (req: any, res: Response, next: NextFunction): void => {
    if(req.body.nToken !== undefined && Number.isInteger(Number(req.body.nToken)) && req.body.nToken > 0){
        next();
    }else{
        next(errorFactory.getError(ErrEnum.InvalidTokenNumber))
    }
}

