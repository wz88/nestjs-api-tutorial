import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ** here is where we use validation globally
  // whitelist set to true in order to remove any undefined key/value
  app.useGlobalPipes(new ValidationPipe({ whitelist: true}));
  await app.listen(3333);
}
bootstrap();
