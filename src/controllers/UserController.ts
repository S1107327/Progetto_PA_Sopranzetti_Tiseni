import {repository} from '../database/Models/repository';
import * as fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import config from '../config'



export class UserController{
    private repo:repository = new repository();

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
            console.error(err);
        }
    }
}