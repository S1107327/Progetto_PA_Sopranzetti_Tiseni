import multer from 'multer';
import * as os from 'os';

/**
 * variabile di configurazione di multer che consente di indicare dove salvare il file che viene caricato
 * e con quale nome esso debba essere salvato
 */
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir())
    },
    filename: (req, file, cb) => {
        let tempName = `${file.originalname}--${Date.now()}`
        cb(null, tempName)
    }
})


export const upload = multer({storage: storage});