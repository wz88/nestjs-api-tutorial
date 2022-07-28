import { IsEmail, IsOptional, IsString } from "class-validator"

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    email?: String

    @IsString()
    @IsOptional()
    firstName?: String

    @IsString()
    @IsOptional()
    lastName?: String
}