import { errorFactory } from "errors/error-factory";
import { ErrEnum } from "errors/error-types";
import { NextFunction, Request, Response } from "express";

export const checkPayload = (req: Request, res: Response, next: NextFunction): void => {
    try {
        req.body = JSON.parse(req.body)
        next()
    } catch (error) {
        next(errorFactory.getError(ErrEnum.InvalidJSONPayload))
    }
}

//TODO: pensare alle validazioni da fare quando si sapranno quali sono i payload json

export function checkJWTPayload (req: any, res: Response, next: NextFunction): void {
    const variableLengthRg: RegExp = /^[a-zA-Z" "]+$/;
    const codiceFiscaleRg: RegExp = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;
    const emailAddressRg: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const countyStateProvinceRg: RegExp = /^[a-zA-Z]{2}$/; 
    
    let commonNameVal: boolean = variableLengthRg.test(req.user.commonName);
    let countryName: boolean = countyStateProvinceRg.test(req.user.countryName);
    let stateOrProvinceName: Boolean = countyStateProvinceRg.test(req.user.stateOrProvinceName);
    let localityName: Boolean = variableLengthRg.test(req.user.localityName);
    let organizationName: Boolean = variableLengthRg.test(req.user.organizationName);
    let organizationalUnitName: Boolean = variableLengthRg.test(req.user.organizationalUnitName);
    let emailAddress: Boolean = emailAddressRg.test(req.user.emailAddress);
    let serialNumber: Boolean = codiceFiscaleRg.test(req.user.serialNumber);
    let SN: Boolean = variableLengthRg.test(req.user.SN);

    if (commonNameVal && countryName && stateOrProvinceName && localityName && organizationName && organizationalUnitName && emailAddress && serialNumber && SN){
        next()
    }else{
        next(errorFactory.getError(ErrEnum.InvalidJWTPayload))
    }

    




}