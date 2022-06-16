import {repository} from '../database/Models/repository';
import * as fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import config from '../config'
import { ErrEnum } from '../errors/error-types';
import {errorFactory} from '../errors/error-factory'



export class UserController{
    repo: repository;
    constructor(){
    this.repo = new repository();
    }

    public createCertificate(request:any, response:any){
        let dati = request.user
        let folderPath: string = path.resolve(__dirname, `../../cnfFiles/${dati.serialNumber}.cnf`)
        try{
            const data = fs.readFileSync(path.resolve(__dirname, "../../config/openssl.cnf"));
            const dataArray = data.toString().split('\n').slice(0,9).join('\n');
            let dim = data.toString().split('\n').length;
            const dataArray2 = data.toString().split('\n').slice(18,dim).join('\n');
            fs.writeFileSync(folderPath, dataArray);
            let noFields: Array<string> = ["iss", "iat", "exp", "aud", "sub"];
            for(let field in dati){
                if(!noFields.includes(field)){
                    fs.appendFileSync(folderPath,`${field}=${dati[field]}\r\n`);
                }
            }
            fs.appendFileSync(folderPath, dataArray2);
            execSync(`openssl req -new -config ${folderPath} -keyout ${dati.serialNumber}.key -passout pass:${config.PEMPASSPHRASE} -out ${dati.serialNumber}.csr`,
                {cwd: path.resolve(__dirname, "../../certificati/")});
            execSync(`openssl x509 -req -days 365 -in ${dati.serialNumber}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${dati.serialNumber}.crt -extensions user_crt -extfile ${folderPath}`,
                {cwd: path.resolve(__dirname, "../../certificati/")});
            response.send("certificate created")
        }catch(err){
            response.status(errorFactory.getError(ErrEnum.SignError).status).json(errorFactory.getError(ErrEnum.SignError).message)
        }
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