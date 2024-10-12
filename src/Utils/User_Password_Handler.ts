import bcrypt from "bcrypt"
export class PasswordHandler
{
    static async HashPassword(pass: string, salt = PasswordHandler.defaultSalt())
    {
        return await bcrypt.hash(pass, salt)
        
    }
    
    static defaultSalt() :number
    {
        return 10
    }
}