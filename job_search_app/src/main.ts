import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.enableCors({
    origin: 'http://localhost:8000', // Cho phép chỉ một domain (thay localhost:8000 bằng domain thực tế nếu cần)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    credentials: true, // Cho phép gửi cookie nếu cần
  });

  app.useStaticAssets(join(__dirname, '..', 'public')); // js, css, javascript
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // html view
  app.setViewEngine('ejs');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  app.useGlobalInterceptors(new TransformInterceptor());

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('Search Job API')
    .setDescription('Search Job API description')
    .setVersion('1.0')
    .addTag('Search Job')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  // await app.listen(3000);
  // await app.listen(8000, '192.168.1.120');
  await app.listen(8000, '192.168.1.10');


}
bootstrap();
