
export interface IPasswordService {
  
    validatePassword(password: string): Promise<Boolean> 
    
    hashPassword(password: string): Promise<string> 
    
    verifyPassword(hashedPassword: string, password: string): Promise<boolean> 
}
