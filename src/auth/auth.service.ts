import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService, private jwt: JwtService, private prisma: PrismaService) {}

    async signup(dto: AuthDto) {
        // generate the password hash
        const hashPassword = await argon.hash(dto.password as string)

        // save the new user in DB
        try {
            const user = await this.prisma.user.create({data: {email: dto.email as string, hash: hashPassword, firstName: dto.firstName as string, lastName: dto.lastName as string}})
            // delete user.hash // not to return the password hash

            // return the saved user
            return this.signToken(user.id, user.email)
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('User already exists!')
                }
            }
            throw error
        }
    }

    async signin(dto: AuthDto) {
        // find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email as string
            }
        })

        // if user doesn't exist, throw an exception
        if (!user) throw new ForbiddenException('User does not exist! Please sign up first.')

        // compare password
        const passwordMatches = await argon.verify(user.hash, dto.password as string)

        // if password is incorrect, throw an exception
        if (!passwordMatches) throw new ForbiddenException('Password provided is incorrect! Please check your password and try again.')
        
        // return the user
        // delete user.hash // not to return the password hash
        return this.signToken(user.id, user.email)
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
        const payload = {sub: userId, email}
        const token = await this.jwt.signAsync(payload, {expiresIn: '15m', secret: this.config.get('JWT_SECRET')})
        return {access_token: token}
    }
}
