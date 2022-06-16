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


    



