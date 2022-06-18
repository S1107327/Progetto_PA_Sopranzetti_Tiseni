import {Repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile, createNewFile, deleteFile } from '../utils/files';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'
import { readRepository } from '../database/Models/readRepository';



export class UserController{
    repo: Repository;
    readRepo: readRepository;
    constructor(){
        this.repo = Repository.getRepo();
        this.readRepo = readRepository.getRepo();
    }

    /**
     * Funzione per la creazione del certificato di un determinato utente
     * @param request 
     * @param response 
     */
    public createCertificate(req:any, res:any){
        let cnfPath: string = path.resolve(__dirname, `../../cnfFiles/${req.user.serialNumber}.cnf`);
        let certificatePath: string = path.resolve(__dirname, "../../certificati/");
        try{
            let user:any = createCnfFile(req.user, cnfPath);
            execSync(`openssl req -new -config ${cnfPath} -keyout ${req.user.serialNumber}.key -passout pass:${config.PEMPASSPHRASE} -out ${req.user.serialNumber}.csr`,
                {cwd: certificatePath});
            execSync(`openssl x509 -req -days 365 -in ${req.user.serialNumber}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${req.user.serialNumber}.crt -extensions user_crt -extfile ${cnfPath}`,
                {cwd: certificatePath});
                res.send({
                    message:`Created certificate for user ${req.user.serialNumber}`,
                    certificate_datas: user
                });
        }catch (err) {
            deleteFile(cnfPath);
            deleteFile(certificatePath+"/"+req.user.serialNumber+".key");
            deleteFile(certificatePath+"/"+req.user.serialNumber+".csr");
            deleteFile(certificatePath+"/"+req.user.serialNumber+".crt");
            let error = errorFactory.getError(ErrEnum.CertCreationError)
            res.status(error.status).json(error.message)
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
        let fileHash: string = req.fileHash;
        let srcDocument: any = req.file;
        this.repo.startSignProcess(srcDocument.originalname, fileHash, req.user.serialNumber, req.body.firmatari)
        .then((document) => {
            let newPath: string | null = createNewFile(req.file, fileHash, document.created_at);
            if (newPath !== null){
                res.send({
                    Success: `Sign Process correctly started for file ${srcDocument.originalname}`,
                    Sign_Process_Id: `To retrieve document or the sign process status use this id: ${document.id}. Please keep it with care.`});
            }else{
                this.repo.cancelSignProcess(document.id);
                let error = errorFactory.getError(ErrEnum.SignError);
                res.status(error.status).json(error.message);
            }
        }).catch((err) => {
            deleteFile(srcDocument.path);
            let error = errorFactory.getError(ErrEnum.SignError);
            res.status(error.status).json(error.message);
        })
    }
    
    /**
     * Funzione che ritorna il numero di token dell'utente che ha fatto la richiesta
     * prendendo il suo codice fiscale dal token JWT
     * @param req: richiesta che arriva dai middleware
     * @param res: risposta da inviare al client 
     */
    public getUserToken (req: any, res: any): void {
        let codice_fiscale: string = req.user.serialNumber;
        this.readRepo.getUser(codice_fiscale).then((user) => {
            //User non può essere null perchè controllato nel middleware
            let nToken = user?.numero_token
            res.send({
                User: codice_fiscale,
                nToken: nToken
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

    public getChallengingNumbers(req: any, res: any): void{
        let codes: Array<number> = Array<number>();
        codes.push(Math.floor(Math.random() * 16)+1);
        codes.push(Math.floor(Math.random() * 16)+1);
        this.repo.setChallengingCodes(req.user.serialNumber, codes, 
                                        new Date(Date.now()+60000));
        res.send(`Send your codes associated to ${codes[0]} and ${codes[1]} to following link\n http://${config.HOST}:${config.PORT}/sign\nPlease specify numbers as shown in the manual`);
    }

    public signDocument(req: any, res:any){

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