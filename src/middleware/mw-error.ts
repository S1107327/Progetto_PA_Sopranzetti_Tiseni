import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";
import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";

export const errorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
    res.status(err.status).json(err.message)
}