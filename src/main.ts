import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // const httpsOptions = {
  //   key: readFileSync('ssl/private.pem'),
  //   cert: readFileSync('ssl/certificate.crt'),
  //   ca: readFileSync('ssl/sslca.ca-bundle'),
  // };
  const app = await NestFactory.create<NestExpressApplication>(AppModule, /*{ httpsOptions } */);

  const config = new DocumentBuilder()
    .setTitle('POS_Backend_Server')
    .setDescription('The POS Backend Server API description')
    .setVersion('1.0')
    .addTag('POS backed  Server')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    index: false,
    prefix: 'uploads',
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();
  await app.listen(5092);

}
bootstrap();
