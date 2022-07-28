import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

// Changed from interface to class because decorators work with classes only
// We need to tell nest to use the pipe validation globally **
export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: String
    
    @IsString()
    @IsNotEmpty()
    password: String

    @IsString()
    @IsOptional()
    firstName: String

    @IsString()
    @IsOptional()
    lastName: String
}