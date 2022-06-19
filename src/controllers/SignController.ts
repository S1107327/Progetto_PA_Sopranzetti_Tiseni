import { ErrEnum } from "../errors/error-types";
import { errorFactory } from "../errors/error-factory";
import { createNewFile, deleteFile } from "../utils/files";
import { Controller } from "./Controller";
import { SignProcess } from "../database/Models/DAOs/signProcessDAO";
import { Document } from "../database/Models/DAOs/documentDAO";
import { execSync } from "child_process";
import config from "../config";
import path from "path";

export class SignController extends Controller{
    
    /**
     * Inizia un nuovo processo di firma caricando il documento sul server e salvando 
     * sul database tutte le informazioni sul documento e tutti i firmatari coinvolti nel
     * processo di firma  
     * 
     * @param {any} req Richiesta che arriva dai middleware
     * @param {any} res Risposta da inviare al client
     */  
    public startSignProcess (req: any, res: any): void { 
        let fileHash: string = req.fileHash;
        let srcDocument: any = req.file;
        this.repo.startSignProcess(srcDocument.originalname, fileHash, req.user.serialNumber, req.body.firmatari)
        .then((document) => {
            let newPath: string | null = createNewFile(req.file, fileHash, Date.parse(document.created_at.toString()));
            if (newPath !== null){
                res.send({
                    Success: `Sign Process correctly started for file ${srcDocument.originalname}`,
                    Sign_Process_Id: `To retrieve the document or the sign process status use this id: ${document.id}. Please keep it with care.`});
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
     * Ritorna all'utente che ha fatto la richiesta le informazioni necessarie per valutare
     * lo stato del processo di firma specificando quali sono i firmatari e chi di loro ha 
     * gia' apposto la firma sul documento
     *  
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
     public getSignProcessStatus( req:any, res: any ): void{
        let processId: number = req.params.id
        this.readRepo.getSignProcessStatus(processId).then((signProcesses: Array<SignProcess> | null) => {
            //Valutare se eliminare if-else sostituendolo con non-null assertion
            if (signProcesses !== null){
                let responseObj: Array<object> = []
                signProcesses.forEach(process => {
                    if (process.stato) {
                        var stato_firma: string = "Firma del documento eseguita"
                    }else{
                        var stato_firma: string = "Firma del documento non ancora eseguita"
                    }
                    let obj = {
                        Codice_fiscale: process.codice_fiscale_firmatario,
                        Stato_firma: stato_firma
                    }
                    responseObj.push(obj)
                });
                res.send(responseObj)
            }
            else{
                let error = errorFactory.getError(ErrEnum.GenericError)
                res.status(error.status).json(error.message)
            }
        }).catch((err: any) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        })
    }

    /**
     * Ritorna all'utente due numeri casuali compresi tra 0 e 15 che sono associati ai due
     * challenging codes che l'utente dovrà inserire per compleatre l'apposizione della firma
     * sul documento
     *  
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
     public getChallengingNumbers(req: any, res: any): void{
        let code_one: number = Math.floor(Math.random() * 16)
        let code_two: number;
        do{
           code_two = Math.floor(Math.random() * 16);
        }while(code_one === code_two);
        this.repo.setChallengingCodes(req.user.serialNumber, [code_one, code_two], 
                                        new Date(Date.now()+300000))
        .catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError)
            res.status(error.status).json(error.message)
        });
        res.send(`Send your codes associated to ${code_one} and ${code_two} to following link\n http://${config.HOST}:${config.PORT}/sign\nPlease specify numbers as shown in the manual`);
    }
    /**
     * Appone la firma dell'utente che ha fatto la richiesta sul documento associato all'id 
     * specificato. Se l'utente che firma è l'ultimo firmatario che doveva apporre la firma,
     * esegue il comando di creazione del documento firmato con estensione .p7m salvandolo nel
     * filesystem del server
     *  
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
    public signDocument(req: any, res:any){
        this.repo.signDocument(req.params.id, req.user.serialNumber).then((last: Boolean) => {
            if(last){
                this.readRepo.getDocument(req.params.id).then((document:Document | null) => {
                    let ext = path.extname(document!.nome_documento)
                    let command: string = `openssl cms -sign -in ./src/${document!.hash_documento}-${Date.parse(document!.created_at.toString())}${ext} -out ./signed/${document!.hash_documento}-${Date.parse(document!.created_at.toString())}${ext}.p7m -nodetach -cades -outform DER -stream -binary -passin pass:${config.PEMPASSPHRASE}`
                    this.readRepo.getSignerById(req.params.id).then((signers: SignProcess[] | null) => {
                        signers!.forEach((signer) => {
                            command += ` -signer ../certificati/${signer.codice_fiscale_firmatario}.crt -inkey ../certificati/${signer.codice_fiscale_firmatario}.key`
                        });
                        try{
                            execSync(command, {cwd: "/home/node/app/documenti"});
                            this.repo.consumeToken(document!.codice_fiscale_richiedente,signers!.length)
                            res.send(`File correctly signed by user ${req.user.serialNumber}`);
                        }catch(err){
                            let error = errorFactory.getError(ErrEnum.SignError);
                            res.status(error.status).json(error.message)
                        }
                    });
                });
            }else{
                res.send(`File correctly signed by user ${req.user.serialNumber}`);
            }
        });
    }

      /**
     * Permette all'utente che ha avviato il processo di firma, di annullare un processo di
     * firma in corso fornendone l'id.
     *  
     * @param {any} req: richiesta che arriva dai middleware
     * @param {any} res: risposta da inviare al client 
     */
    //Si presuppone che arrivati a questo punto si sia verficato che il processo di firma sia effettivamente cancellabile
    public cancelSignProcess(req: any, res: any): void {
        let documentId: number = req.params.id;
        //Valutare se eliminare if-else sostituendolo con non-null assertion
        this.readRepo.getDocument(documentId).then((document:Document | null) => {
            this.repo.cancelSignProcess(documentId).then(() => {
                if (document !== null){
                    let ext: string = path.extname(document.nome_documento)
                    let filePath: string =  `/home/node/app/documenti/src/${document.hash_documento}-${Date.parse(document.created_at.toString())}${ext}`;
                    deleteFile(filePath);
                    res.json("Sign Process has been correctly cancelled");
                }else{
                    let error = errorFactory.getError(ErrEnum.InvalidId);
                    res.status(error.status).res.json(error.message);
                }
            }).catch((err) =>  {
                let error = errorFactory.getError(ErrEnum.GenericError);
                res.status(error.status).res.json(error.message);
            })
        }).catch((err) => {
            let error = errorFactory.getError(ErrEnum.GenericError);
            res.status(error.status).res.json(error.message);
        });
    } 
}