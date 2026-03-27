import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepo: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateClientDto): Promise<Omit<Client, 'updatedAt' | 'password'>> {
    const exists = await this.clientsRepo.findOne({ where: { email: dto.email } });

    if (exists) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const client = this.clientsRepo.create({ ...dto, password: hashed });
    const saved = await this.clientsRepo.save(client);

    const { updatedAt: _, password: __, ...result } = saved;
    return result;
  }

  async login(dto: LoginClientDto): Promise<{ access_token: string; client: Omit<Client, 'updatedAt' | 'password'> }> {
    const client = await this.clientsRepo
      .createQueryBuilder('client')
      .addSelect('client.password')
      .where('client.email = :email', { email: dto.email })
      .getOne();

    if (!client || !(await bcrypt.compare(dto.password, client.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: client.id, email: client.email };
    const access_token = this.jwtService.sign(payload);

    const { updatedAt: _, password: __, ...clientData } = client;
    return { access_token, client: clientData };
  }
}
