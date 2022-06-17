import { errorFactory } from "../errors/error-factory";
import { ErrEnum } from "../errors/error-types";
import { NextFunction, Request, Response } from "express";
import multer from "multer";

export function multerErrorHandler (err: any, req: any, res: Response, next: NextFunction):void {
    if (err instanceof multer.MulterError)
        next(errorFactory.getError(ErrEnum.FileReadingError));
    else
        next(err)
}
export const errorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
    res.status(err.status).send({"error": err.message});
}

export const signProcessErrorHandler = [multerErrorHandler, errorHandler];