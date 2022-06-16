import {ErrorMsg, ErrEnum, GenericError, Forbidden, NotFound, ValidationError, MissingAuthHeader, InvalidJSONPayload, JWTVerifyError, InvalidJWTPayload, UnregisteredUser} from "./error-types"


export const errorFactory = {
    getError: (errType:ErrEnum): ErrorMsg => {
        let returnValue: ErrorMsg;
        switch (errType) {
            case ErrEnum.Forbidden:
                returnValue = new Forbidden();
                break;
            case ErrEnum.NotFound:
                returnValue = new NotFound();
                break;
            case ErrEnum.ValidationError:
                returnValue = new ValidationError();
                break;
            case ErrEnum.MissingAuthHeader:
                returnValue = new MissingAuthHeader();
                break;
            case ErrEnum.InvalidJSONPayload:
                returnValue = new InvalidJSONPayload();
                break;
            case ErrEnum.JWTVerifyError:
                returnValue = new JWTVerifyError();
                break;
            case ErrEnum.InvalidJWTPayload:
                returnValue = new InvalidJWTPayload();
                break;
            case ErrEnum.UnregisteredUser:
                returnValue = new UnregisteredUser();
                break;
            default:
                returnValue = new GenericError();
                break;
        }
        return returnValue
    }
}