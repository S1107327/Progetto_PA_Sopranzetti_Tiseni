import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
    res.status(err.status).json(err.message)
}