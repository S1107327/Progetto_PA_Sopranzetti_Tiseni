import {repository} from '../database/Models/repository';
import * as fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';


export class UserController{
    private repo:repository = new repository();

    public createCertificate(request:any, response:any){
        let dati = request.body;
        try{
            const data = fs.readFileSync(path.resolve(__dirname, "../../config/openssl.cnf"));
            const dataArray = data.toString().split('\n').slice(0,9).join('\n');
            let dim = data.toString().split('\n').length;
            const dataArray2 = data.toString().split('\n').slice(18,dim).join('\n');
            fs.writeFileSync(path.resolve(__dirname, `../../certcnf/${dati.serialNumber}.cnf`), dataArray);
            for(let field in dati){
                fs.appendFileSync(path.resolve(__dirname, `../../certcnf/${dati.serialNumber}.cnf`),`${field}=${dati[field]}\r\n`);
            }
            fs.appendFileSync(path.resolve(__dirname, `../../certcnf/${dati.serialNumber}.cnf`),dataArray2);
            const ls = spawn("ls", ["-la"]);
                ls.stdout.on("data", data => {
                    console.log(`stdout: ${data}`);
                });

                ls.stderr.on("data", data => {
                    console.log(`stderr: ${data}`);
                });

                ls.on('error', (error) => {
                    console.log(`error: ${error.message}`);
                });

                ls.on("close", code => {
                    console.log(`child process exited with code ${code}`);
                });
            response.send("file written")
        }catch(err){
            console.error(err);
        }
    }
}