import bcrypt from "bcrypt"
import crypto from "crypto"
import { CommonErrorCode } from "../Models/Common/ErrorCodes"
import { AuthConf } from "../Configurations/Conf_Authentication"
export class AuthenticationHandler
{
    static async HashPassword(pass: string, salt = AuthenticationHandler.defaultSalt())
    {
        try{
            return await bcrypt.hash(pass, salt)
        }catch(e)
        {
            throw {
                message: `Cannot hash password: ${pass}`,
                code: CommonErrorCode.CannotHashPassword
            }
        }
    }
    
    static async ComparePassword(input: string, hashed: string)
    {
        return await bcrypt.compare(input, hashed)
    }
    
    static async GenerateRandomAuthToken()
    {
        return crypto.randomBytes(AuthConf.AuthToken_BytesCount).toString('hex')
    }
    
    static defaultSalt() :number
    {
        return 10
    }
}