import { Module, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, BookmarkModule, ConfigModule.forRoot({isGlobal: true}), PrismaModule, UserModule],
  // here the pipeline binding has been done outside the context of the module
  // for AuthDto, since we defined the interface outside of the module
  // https://docs.nestjs.com/pipes#global-scoped-pipes
  providers: [{provide: APP_PIPE, useClass: ValidationPipe}]
})
export class AppModule {}
