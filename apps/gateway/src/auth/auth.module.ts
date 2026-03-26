import { Module } from '@nestjs/common';
import { AuthClientProvider } from 'y/common';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthClientProvider],
})
export class AuthGatewayModule {}
