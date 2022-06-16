import multer from 'multer';
import * as os from 'os';


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