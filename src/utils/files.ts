import path from 'path';
import * as fs from 'fs';
import mime from 'mime-types'

export const createCnfFile = (dati: any, folderPath: string) => {
    const data = fs.readFileSync(path.resolve(__dirname, "../../config/openssl.cnf"));
    const dataArray = data.toString().split('\n').slice(0,9).join('\n');
    let dim = data.toString().split('\n').length;
    const dataArray2 = data.toString().split('\n').slice(18,dim).join('\n');
    fs.writeFileSync(folderPath, dataArray);
    let noFields: Array<string> = ["iss", "iat", "exp", "aud", "sub"];
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
 * Funzione che crea un nuovo file sull cartella documenti/src/
 * @param srcDocument req.file prodotto da multer con tutte le informazioni sul file
 * @param fileHash hash del contenuto del file con i codici fiscali
 */
export function createNewFile (srcDocument: any , fileHash: string, createdAt: any): string | null {
    //TODO: controllare quale è la data del documento, se si vuole usare (caso firme multiple con stessi firmatari) deve corrispondere a quella sul db
    try{
        let extension = mime.extension(srcDocument.mimetype);
        let filePath: string = `/home/node/app/documenti/src/${fileHash}-${createdAt}.${extension}`;
        let srcDocumentBuffer: Buffer = fs.readFileSync(srcDocument.path);
        //TODO: controllare se salvare il buffer va bene
        fs.writeFileSync(filePath, srcDocumentBuffer);
        return filePath;
    }catch(err){
        return null;
    }finally{
        deleteFile(srcDocument.path);
    }
}

export function deleteFile(filepath: string): void{
    fs.unlink(filepath, (err) => {
        if(err){
            console.error('cannot delete file');
            return;
        }
        console.log(`deleted ${filepath}`)
    });
}