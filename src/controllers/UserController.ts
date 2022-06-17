import {repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile, createNewFile } from '../utils/files';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'
import fs, { readFileSync } from 'fs';
import crypto from "crypto";



export class UserController{
    repo: repository;
    constructor(){
    this.repo = new repository();
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
        createNewFile(req.file, fileHash)
        }catch (err){
            fs.unlink(srcDocument.path, ()=>{})
            let error = errorFactory.getError(ErrEnum.SignError)
            res.status(error.status).json(error.message)
        }
        //Una volta creato il file salvo lo stesso sul database
        //TODO: chiamare la funzione della repository per salvare il documento
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
        let codice_fiscale: string = req.user.serialNumber;
        this.repo.getUser(codice_fiscale).then((user) => {
            //User non può essere null perchè controllato nel middleware
            let nToken = user?.numero_token
            res.send({
                User: codice_fiscale,
                nToken: nToken
            }).catch((err: any) => {
                let error = errorFactory.getError(ErrEnum.GenericError)
                res.status(error.status).json(error.message)
            })
        })
    }

    /**
     * Funzione che ritorna lo stato del processo di firma
     *  
     * @param req 
     * @param res 
     */
    public getSignProcessStatus( req:any, res: any ): void{
        //Si suppone che l'id del documento voluto sia messo nell'header della richiesta get
        //TODO: creare un middleware che controlla l'esistenza del docuemnto
        let processId: number = req.headers.processId;
        this.repo.getSignProcessStatus(processId).then((result) => {
            //TODO: in base a quello che ritorna la funzione retituire all'utente la risposta sullo stato di firma
        }).catch((err: any) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })




    }
        
}