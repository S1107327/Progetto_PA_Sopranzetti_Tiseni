import {repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile } from '../utils/files';
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

    public startSignProcess (req: any, res: any): void { 
        /* 1. Prendere i dati dalla request in cui sono indicate tutte le informazioni per il processo di firma 2. In base ai dati distinguere se si tratta di un processo di firma multiplo o singolo
        3. Acquisire il file nel payload
        4. Controllare che quel medesimo documento non sia già stato firmato dalle stesse persone in passato
        5. Inserire il documento nel server
        6. Inserire il documento nel db e il nuovo processo di firma in caso di firma multipla
        */
        let textBody: any = req.body;
        let srcDocument: any = req.file;
        console.log(req.body)
        console.log(req.file)
        //TODO: spostare la validazione nel middleware
        //TODO: controllare se il path è effettivamente quello corretto
        let srcDocumentBuffer: Buffer = readFileSync(srcDocument.path)
        console.log(srcDocumentBuffer)
        //Hash del file nel caso in cui non si possa far firmare lo stesso file più volte agli stessi firmatari
        let fileHash = crypto.createHash('sha256').update(`${srcDocumentBuffer}${textBody.firmatari.join['']}`).digest('hex');
        console.log(fileHash)
        //Deleting temporary file after usage
        fs.unlink(srcDocument.path, ()=>{})
        
        }
        
}