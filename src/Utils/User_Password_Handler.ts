import bcrypt from "bcrypt"
import { CommonErrorCode } from "../Models/Common/ErrorCodes"
export class PasswordHandler
{
    static async HashPassword(pass: string, salt = PasswordHandler.defaultSalt())
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
    
    static defaultSalt() :number
    {
        return 10
    }
}