import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.TCP,
    options: {
      port: +process.env.AUTH_SERVICE_PORT || 3001,
    },
  });

  await app.listen();
  console.log(`Auth microservice listening on TCP port ${process.env.AUTH_SERVICE_PORT || 3001}`);
}
bootstrap();
