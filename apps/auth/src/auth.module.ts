import { Module } from '@nestjs/common';
import { DatabaseModule } from 'y/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [DatabaseModule, ClientsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
