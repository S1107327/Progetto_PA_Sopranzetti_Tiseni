import path from 'path';
import * as fs from 'fs';
import * as openssl from './commands';
import mime from 'mime-types';

/**
 * Crea un nuovo file di configurazione associato a un utente, per la creazione dei 
 * certificati
 * @param {any} dati dati dell'utente da inserire all'interno del file di configurazione
 * @param {string} folderPath path alla cartella in cui inserire il file di configurazione
 * @returns {any} un oggetto creato ad hoc con tutti i dati nel certificato
 */
export const createCnfFile = (dati: any, folderPath: string): any => {
    const data = fs.readFileSync(path.resolve(__dirname, "../../config/openssl.cnf"));
    const dataArray = data.toString().split('\n').slice(0,9).join('\n');
    let dim = data.toString().split('\n').length;
    const dataArray2 = data.toString().split('\n').slice(18,dim).join('\n');
    fs.writeFileSync(folderPath, dataArray);
    let noFields: Array<string> = ["iss", "iat", "exp", "aud", "sub", "role"];
    let user: any = {};
    for(let field in dati){
        if(!noFields.includes(field)){
            fs.appendFileSync(folderPath,`${field}=${dati[field]}\r\n`);
            user[`${field}`] = dati[field];
        }
    }
    fs.appendFileSync(folderPath, dataArray2);

    return user;
}

/**
 * Crea un nuovo file nella cartella che contine i documenti sorgenti, da firmare, e in
 * caso di errori annulla il processo
 * @param srcDocument req.file prodotto da multer con tutte le informazioni sul file
 * @param fileHash hash del contenuto del file con i codici fiscali
 * @returns {string | null} il path al file creato
 */
export function createNewFile (srcDocument: any , fileHash: string, createdAt: any): string | null {
    try{
        let extension = mime.extension(srcDocument.mimetype);
        let filePath: string = `${openssl.documentFolder}/src/${fileHash}-${createdAt}.${extension}`;
        let srcDocumentBuffer: Buffer = fs.readFileSync(srcDocument.path);
        fs.writeFileSync(filePath, srcDocumentBuffer);
        return filePath;
    }catch(err){
        return null;
    }finally{
        deleteFile(srcDocument.path);
    }
}

/**
 * Cancella il file corrispondente al path passato come parametro
 * @param {string} filepath path al file da cancellare
 */

export function deleteFile(filepath: string): void{
    fs.unlink(filepath, (err) => {
        if(err){
            console.error('cannot delete file');
            return;
        }
        console.log(`deleted ${filepath}`);
    });
}