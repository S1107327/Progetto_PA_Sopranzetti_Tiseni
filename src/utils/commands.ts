import { execSync } from "child_process";
import path from "path";
import config from "../config";
import { Document } from "../database/Models/DAOs/documentDAO";

//path alla cartella che contiene tutti i  certificati degli utenti
export const certificatePath: string = path.resolve(__dirname, "../../certificati/");

//path alla cartella che contiene tutti i documenti firmati e non
export const documentFolder: string = "/home/node/app/documenti";

/**
 * Restituisce il path al file di configurazione associato all'utente registrato
 * @param codice_fiscale il codice fiscale dell'utente registrato
 * @returns {string} path del file di configurazione
 */
export const getCnfPath = (codice_fiscale: string): string => {
    return path.resolve(__dirname, `../../cnfFiles/${codice_fiscale}.cnf`);
}

/**
 * Crea un certificato x509 eseguendo il comando openssl sul server
 * @param codice_fiscale codice fiscale dell'utente che richiede il certificato
 * @param cnfPath path del file di configurazione associato all'utente
 */
export const opensslCreateCertificate = (codice_fiscale: string, cnfPath:string): void => {
    execSync(`openssl req -new -config ${cnfPath} -keyout ${codice_fiscale}.key -passout pass:${config.PEMPASSPHRASE} -out ${codice_fiscale}.csr`,
                {cwd: certificatePath});
    execSync(`openssl x509 -req -days 365 -in ${codice_fiscale}.csr -CA ../config/rootCACert.pem -CAkey ../config/rootCAKey.pem -CAcreateserial -out ${codice_fiscale}.crt -extensions user_crt -extfile ${cnfPath}`,
                {cwd: certificatePath});
}

/**
 * Ritorna la base del comando per firmare un documento con openssl, da completare poi
 * aggiungendo tutti i firmatari di quel documento
 * @param document l'istanza del documento da firmare
 * @returns {string} la base del comando per firmare un documento
 */

export const opensslSignBase = (document: Document): string => {
    let ext = path.extname(document!.nome_documento);
    return `openssl cms -sign -in ./src/${document!.hash_documento}-${Date.parse(document!.created_at.toString())}${ext} -out ./signed/${document!.hash_documento}-${Date.parse(document!.created_at.toString())}${ext}.p7m -nodetach -cades -outform DER -stream -binary -passin pass:${config.PEMPASSPHRASE}`;
}

/**
 * Completa il comando base per firmare un documento con openssl, aggiungendo tutte le opzioni
 * per includere i firmatari
 * @param codice_fiscale il codice fiscale del firmatario
 * @returns {string} il comando completo da eseguire con openssl per firmare un documento
 */
export const opensslAddSigner = (codice_fiscale: string): string => {
    return ` -signer ../certificati/${codice_fiscale}.crt -inkey ../certificati/${codice_fiscale}.key`;
}