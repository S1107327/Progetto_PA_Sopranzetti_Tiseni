import * as DBMW from './mw-async-db';
import * as ERRMW from './mw-error';
import * as VALIDMW from './mw-validation'


export const MWSignDocument = [DBMW.checkId, VALIDMW.checkCertificateExistance, 
                                DBMW.checkSigner, DBMW.checkExpiration, DBMW.checkChallString, ERRMW.errorHandler];
