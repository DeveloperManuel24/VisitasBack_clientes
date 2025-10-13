import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Usuario } from '../visitas/entities/usuario.entity';
import { Visita } from './entities/visita.entity';
import { EventoVisita } from './entities/evento-visita.entity';
import { Evidencia } from './entities/evidencia.entity';
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';
import { QueryVisitaDto } from './dto/query-visita.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { VisitaEstado, EventoVisitaTipo } from './enums/visita.enums';
import { genId } from '../common/ids'; // tu helper ULID

@Injectable()
export class VisitasService {
  constructor(
    @InjectRepository(Visita) private readonly repo: Repository<Visita>,
    @InjectRepository(EventoVisita) private readonly evRepo: Repository<EventoVisita>,
    @InjectRepository(Evidencia) private readonly evidRepo: Repository<Evidencia>,
    @InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  private qbBase(qb?: SelectQueryBuilder<Visita>) {
    const q = qb ?? this.repo.createQueryBuilder('v');
    return q
      .leftJoinAndSelect('v.cliente', 'c')
      .leftJoinAndSelect('v.supervisor', 'sup')
      .leftJoinAndSelect('v.tecnico', 'tec')
      .leftJoinAndSelect('v.eventos', 'ev')
      .leftJoinAndSelect('v.evidencias', 'evi')
      .where('v.eliminadoEn IS NULL');
  }

  private async ensureCliente(id: string) {
    const c = await this.clienteRepo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!c) throw new BadRequestException('Cliente inexistente');
    return c;
  }
  private async ensureUsuario(id?: string | null, label = 'Usuario') {
    if (!id) return null;
    const u = await this.usuarioRepo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!u) throw new BadRequestException(`${label} inexistente`);
    return u;
  }

  private async addEvento(visitaId: string, tipo: EventoVisitaTipo, meta?: Record<string, any>) {
    const ev = this.evRepo.create({ id: genId(), visitaId, tipo, meta: meta ?? {} });
    await this.evRepo.save(ev);
  }

  async create(dto: CreateVisitaDto) {
    await this.ensureCliente(dto.clienteId);
    await this.ensureUsuario(dto.supervisorId ?? null, 'Supervisor');
    await this.ensureUsuario(dto.tecnicoId ?? null, 'Técnico');

    const v = this.repo.create({
      id: genId(),
      clienteId: dto.clienteId,
      supervisorId: dto.supervisorId ?? null,
      tecnicoId: dto.tecnicoId ?? null,
      scheduledAt: new Date(dto.scheduledAt),
      estado: dto.estado ?? VisitaEstado.PENDIENTE,
      notaSupervisor: dto.notaSupervisor ?? null,
    });

    const saved = await this.repo.save(v);
    await this.addEvento(saved.id, EventoVisitaTipo.CREADA, {
      scheduledAt: saved.scheduledAt,
      supervisorId: saved.supervisorId,
      tecnicoId: saved.tecnicoId,
    });
    if (saved.supervisorId) await this.addEvento(saved.id, EventoVisitaTipo.ASIGNADA_SUPERVISOR, { supervisorId: saved.supervisorId });
    if (saved.tecnicoId) await this.addEvento(saved.id, EventoVisitaTipo.ASIGNADA_TECNICO, { tecnicoId: saved.tecnicoId });

    return this.findOne(saved.id);
  }

  async findAll(query: QueryVisitaDto) {
    const { q, page = 1, limit = 10, estado, supervisorId, tecnicoId, clienteId, from, to } = query;

    let qb = this.qbBase();

    if (q?.trim()) {
      qb = qb.andWhere(
        '(c.nombre ILIKE :q OR v.notaSupervisor ILIKE :q OR v.notaTecnico ILIKE :q)',
        { q: `%${q.trim()}%` },
      );
    }
    if (estado) qb = qb.andWhere('v.estado = :estado', { estado });
    if (supervisorId) qb = qb.andWhere('v.supervisorId = :supervisorId', { supervisorId });
    if (tecnicoId) qb = qb.andWhere('v.tecnicoId = :tecnicoId', { tecnicoId });
    if (clienteId) qb = qb.andWhere('v.clienteId = :clienteId', { clienteId });
    if (from || to) {
      const f = from ? new Date(from) : new Date('1970-01-01');
      const t = to ? new Date(to) : new Date('2999-12-31');
      qb = qb.andWhere('v.scheduledAt BETWEEN :f AND :t', { f, t });
    }

    qb = qb.orderBy('v.scheduledAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const v = await this.qbBase().andWhere('v.id = :id', { id }).getOne();
    if (!v) throw new NotFoundException('Visita no encontrada');
    return v;
  }

  async update(id: string, dto: UpdateVisitaDto) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');

    // cambios con eventos
    if (dto.supervisorId && dto.supervisorId !== v.supervisorId) {
      await this.ensureUsuario(dto.supervisorId, 'Supervisor');
      v.supervisorId = dto.supervisorId;
      await this.addEvento(id, EventoVisitaTipo.ASIGNADA_SUPERVISOR, { supervisorId: v.supervisorId });
    }
    if (dto.tecnicoId && dto.tecnicoId !== v.tecnicoId) {
      await this.ensureUsuario(dto.tecnicoId, 'Técnico');
      v.tecnicoId = dto.tecnicoId;
      await this.addEvento(id, EventoVisitaTipo.ASIGNADA_TECNICO, { tecnicoId: v.tecnicoId });
    }
    if (typeof dto.notaSupervisor === 'string' && dto.notaSupervisor !== v.notaSupervisor) {
      v.notaSupervisor = dto.notaSupervisor;
      await this.addEvento(id, EventoVisitaTipo.NOTA_SUP, { nota: v.notaSupervisor });
    }
    if (typeof dto.notaTecnico === 'string' && dto.notaTecnico !== v.notaTecnico) {
      v.notaTecnico = dto.notaTecnico;
      await this.addEvento(id, EventoVisitaTipo.NOTA_TEC, { nota: v.notaTecnico });
    }
    if (dto.scheduledAt && new Date(dto.scheduledAt).toISOString() !== v.scheduledAt.toISOString()) {
      v.scheduledAt = new Date(dto.scheduledAt);
      await this.addEvento(id, EventoVisitaTipo.REPROGRAMADA, { scheduledAt: v.scheduledAt });
    }

    // No se permite setear COMPLETADA/CANCELADA por aquí (usa endpoints dedicados)
    await this.repo.save(v);
    return this.findOne(id);
  }

  async checkIn(id: string, dto: CheckInDto) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');
    if (v.estado !== VisitaEstado.PENDIENTE) {
      throw new BadRequestException('Solo se puede hacer check-in de visitas PENDIENTES');
    }
    v.checkInAt = dto.at ? new Date(dto.at) : new Date();
    v.checkInLat = dto.lat;
    v.checkInLng = dto.lng;
    v.notaTecnico = dto.notaTecnico ?? v.notaTecnico ?? null;
    v.estado = VisitaEstado.EN_CURSO;

    await this.repo.save(v);
    await this.addEvento(id, EventoVisitaTipo.CHECK_IN, {
      at: v.checkInAt, lat: v.checkInLat, lng: v.checkInLng, nota: dto.notaTecnico ?? null,
    });
    return this.findOne(id);
  }

  async checkOut(id: string, dto: CheckOutDto) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');
    if (v.estado !== VisitaEstado.EN_CURSO) {
      throw new BadRequestException('Solo se puede hacer check-out de visitas EN_CURSO');
    }
    v.checkOutAt = dto.at ? new Date(dto.at) : new Date();
    v.checkOutLat = dto.lat;
    v.checkOutLng = dto.lng;
    v.notaTecnico = dto.notaTecnico ?? v.notaTecnico ?? null;

    // duración
    if (v.checkInAt) {
      const ms = v.checkOutAt.getTime() - v.checkInAt.getTime();
      v.duracionMin = Math.max(0, Math.round(ms / 60000));
    } else {
      v.duracionMin = null;
    }
    v.estado = VisitaEstado.COMPLETADA;

    await this.repo.save(v);
    await this.addEvento(id, EventoVisitaTipo.CHECK_OUT, {
      at: v.checkOutAt, lat: v.checkOutLat, lng: v.checkOutLng, nota: dto.notaTecnico ?? null,
    });
    await this.addEvento(id, EventoVisitaTipo.COMPLETADA, { duracionMin: v.duracionMin });
    return this.findOne(id);
  }

  async cancel(id: string, motivo?: string) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');
    if (v.estado === VisitaEstado.COMPLETADA) {
      throw new BadRequestException('No se puede cancelar una visita completada');
    }
    v.estado = VisitaEstado.CANCELADA;
    await this.repo.save(v);
    await this.addEvento(id, EventoVisitaTipo.CANCELADA, { motivo: motivo ?? null });
    return this.findOne(id);
  }

  async addEvidencia(id: string, dto: CreateEvidenciaDto) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');

    const ev = this.evidRepo.create({
      id: genId(),
      visitaId: id,
      tipo: dto.tipo,
      url: dto.url,
      descripcion: dto.descripcion ?? null,
    });
    await this.evidRepo.save(ev);
    return this.findOne(id);
  }

  async remove(id: string) {
    const v = await this.repo.findOne({ where: { id, eliminadoEn: IsNull() } });
    if (!v) throw new NotFoundException('Visita no encontrada');
    await this.repo.softRemove(v);
    return { ok: true, id, eliminadoEn: new Date().toISOString() };
  }
}
