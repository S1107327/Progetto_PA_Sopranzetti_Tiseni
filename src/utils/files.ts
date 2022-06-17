import path from 'path';
import * as fs from 'fs';

export const createCnfFile = (dati: any, folderPath: string) => {
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
}

/**
 * Funzione che crea un nuovo file sull cartella documenti/src/
 * @param srcDocument req.file prodotto da multer con tutte le informazioni sul file
 * @param fileHash hash del contenuto del file con i codici fiscali
 */
export function createNewFile (srcDocument: any , fileHash: string): void{
    let extArray = srcDocument.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    let filePath: string = `/home/node/app/documenti/src/${fileHash}-${Date.now}.${extension}`
    let srcDocumentBuffer: Buffer = fs.readFileSync(srcDocument.path)
    //TODO: controllare se salvare il buffer va bene
    fs.writeFileSync(filePath, srcDocumentBuffer)
}