import {repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile, createNewFile } from '../utils/files';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'
import { readRepository } from '../database/Models/readRepository';
import fs, { read, readFileSync } from 'fs';
import crypto from "crypto";



export class UserController{
    repo: repository;
    readRepo: readRepository;
    constructor(){
    //TODO: controllare perchè non vengono instanziate
    this.repo = new repository();
    this.readRepo = new readRepository();
    }

    /**
     * Funzione per la creazione del certificato di un determinato utente
     * @param request 
     * @param response 
     */
    public createCertificate(request:any, response:any){
        let folderPath: string = path.resolve(__dirname, `../../cnfFiles/${request.user.serialNumber}.cnf`);
        try{
        createCnfFile(request.user, folderPath);
        execSync(`openssl req -new -config ${folderPath} -keyout ${request.user.dati.serialNumber}.key -passout pass:${config.PEMPASSPHRASE} -out ${request.user.dati.serialNumber}.csr`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        execSync(`openssl x509 -req -days 365 -in ${request.user.serialNumber}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${request.user.serialNumber}.crt -extensions user_crt -extfile ${folderPath}`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        response.send("certificate created");
        }catch (err) {
            //TODO: in caso di errore cancellare tutti i file che sono stati creati
            let error = errorFactory.getError(ErrEnum.SignError)
            response.status(error.status).json(error.message)
        }
    }

    /**
     * Funziona che inizia un nuovo processo di firma caricando il documento sul server 
     * e salvando sul database tutte le informazioni sul documento e 
     * tutti i processi di firma dei firmatari 
     * 
     * @param req Richiesta che arriva dai middleware
     * @param res Risposta da inviare al client
     */
    public startSignProcess (req: any, res: any): void { 
        console.log(req.file)
        let fileHash = req.fileHash;
        let textBody: any = req.body;
        let srcDocument: any = req.file;
        try{
            //TODO: chiamare la funzione della repository per salvare il documento
            //TODO: prendere la data di creazione direttamente dal db
            let createdAt= Date.now()
            createNewFile(req.file, fileHash, createdAt)
        }catch (err){
            fs.unlink(srcDocument.path, ()=>{})
            let error = errorFactory.getError(ErrEnum.SignError)
            res.status(error.status).json(error.message)
        }

        //TODO: diminuire di token dell'utente

        //Deleting temporary file after usage
        fs.unlink(srcDocument.path, ()=>{})
        }
    
    /**
     * Funzione che ritorna il numero di token dell'utente che ha fatto la richiesta
     * prendendo il suo codice fiscale dal token JWT
     * @param req: richiesta che arriva dai middleware
     * @param res: risposta da inviare al client 
     */
    public getUserToken (req: any, res: any): void {
        let readingRepo = new readRepository();
        let codice_fiscale: string = req.user.serialNumber;
        readingRepo.getUser(codice_fiscale).then((user) => {
            //User non può essere null perchè controllato nel middleware
            let nToken = user?.numero_token
            res.send({
                User: codice_fiscale,
                Token: nToken
            })
        }).catch((err: any) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })
    }

    /**
     * Funzione che ritorna lo stato del processo di firma
     *  
     * @param req 
     * @param res 
     */
    public getSignProcessStatus( req:any, res: any ): void{
        let processId: number = req.headers.processId;
        this.readRepo.getSignProcessStatus(processId).then((result) => {
            //TODO: in base a quello che ritorna la funzione retituire all'utente la risposta sullo stato di firma
            if (result)
                res.send({Process_satus: "Completely signed"})
            else
                res.send({Process_status: "Still in progress"})
        }).catch((err: any) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })

    }

    public getSignedDocument(req: any, res: any): void {
        let documentId: number = req.headers.id
        this.readRepo.getDocument(documentId).then((document) => {
            let hashName = document?.hash_documento
            let createAt = document?.created_at
            //TODO: da completare
        })
    }
        
}