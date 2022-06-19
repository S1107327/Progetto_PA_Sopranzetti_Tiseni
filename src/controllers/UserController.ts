import { execSync } from 'child_process';
import { createCnfFile, deleteFile } from '../utils/files';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'
import { Controller } from './Controller';

export class UserController extends Controller{

    /**
     * Esegue i comandi di creazione delle chiavi private e della richiesta di creazione di 
     * un certificato, e poi esegue il comando per la creazione del file che costituisce il 
     * certificato vero e proprio, per per permettere agli utenti di apporre le firme sui 
     * documenti
     * 
     * @param {any} req Richiesta che arriva dai middleware
     * @param {any} res Risposta da inviare al client
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
    //TODO: fare documentazione
    public invalidateCertificate ( req: any, res: any,): void {
        //Prima versione di invalidazione del certificato dove si cancella tutto
        let cnfPath: string = path.resolve(__dirname, `../../cnfFiles/${req.user.serialNumber}.cnf`);
        let certificatePath: string = path.resolve(__dirname, "../../certificati/");
        deleteFile(cnfPath);
        deleteFile(certificatePath+"/"+req.user.serialNumber+".key");
        deleteFile(certificatePath+"/"+req.user.serialNumber+".csr");
        deleteFile(certificatePath+"/"+req.user.serialNumber+".crt");
        res.json("Certificate has been correctly invalidated")
    }
    
    /**
     * Ritorna il numero di token dell'utente che ha fatto la richiesta utilizzando il 
     * codice fiscale espresso nel payload del token JWT
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
    public getUserToken (req: any, res: any): void {
        let codice_fiscale: string = req.user.serialNumber;
        this.readRepo.getUser(codice_fiscale).then((user) => {
            //User non può essere null perchè controllato nel middleware
            let nToken = user!.numero_token
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
     * Permette all'utente che ha avviato il processo di firma, una volta che questo è 
     * terminato di scaricare il documento firmato con estensione .p7m con il nome originale
     *  
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
    public getSignedDocument(req: any, res: any): void {
        let documentId: number = req.params.id
        this.readRepo.getDocument(documentId).then((document) => {
            let hashName = document!.hash_documento
            let extension = path.extname(document!.nome_documento)
            let createAt = Date.parse(document!.created_at.toString())
            let filePath: string = `/home/node/app/documenti/signed/${hashName}-${createAt}${extension}.p7m`
            let filename: string = `${document!.nome_documento}.p7m`
            res.download(filePath, filename, (err: any) => {
                if(err){
                    let error = errorFactory.getError(ErrEnum.GenericError);
                    res.status(error.status).json(error.message);
                }
            });
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        });
    }

}