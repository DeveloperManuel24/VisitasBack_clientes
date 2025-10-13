import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { QueryClienteDto } from './dto/query-cliente.dto';
import { genId } from 'src/common/ids';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const entity = this.repo.create({ ...dto, id: genId() });
    return this.repo.save(entity);
  }

  async findAll(query: QueryClienteDto) {
    const { q, page = 1, limit = 10 } = query;

    const whereBase: any = { eliminadoEn: IsNull() };
    const where = q?.trim()
      ? [
          { ...whereBase, nombre: ILike(`%${q.trim()}%`) },
          { ...whereBase, direccion: ILike(`%${q.trim()}%`) },
        ]
      : whereBase;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { creadoEn: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Cliente> {
    const found = await this.repo.findOne({
      where: { id, eliminadoEn: IsNull() },
    });
    if (!found) throw new NotFoundException('Cliente no encontrado');
    return found;
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const found = await this.findOne(id);
    Object.assign(found, dto);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<{ ok: true; id: string; eliminadoEn: string }> {
    const found = await this.findOne(id);
    await this.repo.softRemove(found);
    return { ok: true, id: found.id, eliminadoEn: new Date().toISOString() };
  }
}
