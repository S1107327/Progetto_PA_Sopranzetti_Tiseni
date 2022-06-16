import {repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile } from '../utils/files';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'
import fs from 'fs';



export class UserController{
    repo: repository;
    constructor(){
    this.repo = new repository();
    }

    public createCertificate(request:any, response:any){
        let folderPath: string = path.resolve(__dirname, `../../cnfFiles/${request.user.serialNumber}.cnf`);
        createCnfFile(request.user, folderPath);
        execSync(`openssl req -new -config ${folderPath} -keyout ${request.user.dati.serialNumber}.key -passout pass:${config.PEMPASSPHRASE} -out ${request.user.dati.serialNumber}.csr`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        execSync(`openssl x509 -req -days 365 -in ${request.user.serialNumber}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${request.user.serialNumber}.crt -extensions user_crt -extfile ${folderPath}`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        response.send("certificate created");
    }

    public startSignProcess (req: any, res: any): void { 
        /* 1. Prendere i dati dalla request in cui sono indicate tutte le informazioni per il processo di firma 2. In base ai dati distinguere se si tratta di un processo di firma multiplo o singolo
        3. Acquisire il file nel payload
        4. Controllare che quel medesimo documento non sia già stato firmato dalle stesse persone in passato
        5. Inserire il documento nel server
        6. Inserire il documento nel db e il nuovo processo di firma in caso di firma multipla
        */
        //TODO: remember to "fs.unLink()" the termporary file after it is permanently saved
        let textBody: any = req.body;
        let srcDocument: any = req.file;
        //let tempName = crypto.createHash('sha256').update(`${file.originalname}${Date.now()}`).digest('hex');
        console.log("FILENAMEssss")
        console.log(srcDocument);
        console.log(textBody);
        console.log(fs.readFileSync(srcDocument.path).toString())
        fs.unlink(srcDocument.path, ()=>{})
        }
}