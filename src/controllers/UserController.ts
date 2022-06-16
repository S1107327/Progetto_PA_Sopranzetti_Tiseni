import {repository} from '../database/Models/repository';
import { execSync } from 'child_process';
import { createCnfFile } from '../utils/files';
import path from 'path';
import config from '../config'



export class UserController{
    private repo:repository = new repository();

    public createCertificate(request:any, response:any){
        let folderPath: string = path.resolve(__dirname, `../../cnfFiles/${request.user.serialNumber}.cnf`);
        createCnfFile(request.user, folderPath);
        execSync(`openssl req -new -config ${folderPath} -keyout ${request.user.dati.serialNumber}.key -passout pass:${config.PEMPASSPHRASE} -out ${request.user.dati.serialNumber}.csr`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        execSync(`openssl x509 -req -days 365 -in ${request.user.serialNumber}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${request.user.serialNumber}.crt -extensions user_crt -extfile ${folderPath}`,
            {cwd: path.resolve(__dirname, "../../certificati/")});
        response.send("certificate created");
    }
}