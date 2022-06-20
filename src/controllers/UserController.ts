import { createCnfFile, deleteFile } from '../utils/files';
import path from 'path';
import * as openssl from '../utils/commands';
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
        let cnfPath: string = openssl.getCnfPath(req.user.serialNumber);
        try{
            let user:any = createCnfFile(req.user, cnfPath);
            openssl.opensslCreateCertificate(req.user.serialNumber, cnfPath);
                res.send({
                    message:`Created certificate for user ${req.user.serialNumber}`,
                    certificate_datas: user
                });
        }catch (err) {
            deleteFile(cnfPath);
            deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".key");
            deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".csr");
            deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".crt");
            let error = errorFactory.getError(ErrEnum.CertCreationError)
            res.status(error.status).json(error.message)
        }
    }
    /**
     * Invalida un certificato associato ad un utente cancellando: il file .key, il file .csr,
     * il file .crt e il file di confidurazione .cnf
     * @param {any} req la richiesta che arriva dai middleware che l'hanno validata in precedenza
     * @param {any} res la risposta da inviare al client
     */
    public invalidateCertificate ( req: any, res: any,): void {
        //Prima versione di invalidazione del certificato dove si cancella tutto
        let cnfPath: string = openssl.getCnfPath(req.user.serialNumber);
        deleteFile(cnfPath);
        deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".key");
        deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".csr");
        deleteFile(openssl.certificatePath+"/"+req.user.serialNumber+".crt");
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