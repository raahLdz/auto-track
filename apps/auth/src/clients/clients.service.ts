import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepo: Repository<Client>,
  ) {}

  async register(dto: CreateClientDto): Promise<Omit<Client, 'updatedAt'>> {
    const exists = await this.clientsRepo.findOne({ where: { email: dto.email } });

    if (exists) {
      throw new ConflictException('El correo ya está registrado');
    }

    const client = this.clientsRepo.create(dto);
    const saved = await this.clientsRepo.save(client);

    const { updatedAt: _, ...result } = saved;
    return result;
  }
}
