import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  Index, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../visitas/entities/usuario.entity';
import { EventoVisita } from './evento-visita.entity';
import { Evidencia } from './evidencia.entity';
import { VisitaEstado } from '../enums/visita.enums';



@Entity('visita')
@Index('idx_visita_cliente', ['clienteId'])
@Index('idx_visita_supervisor', ['supervisorId'])
@Index('idx_visita_tecnico', ['tecnicoId'])
@Index('idx_visita_estado', ['estado'])
@Index('idx_visita_scheduled_at', ['scheduledAt'])
export class Visita {
  @PrimaryColumn({ type: 'varchar', length: 50 }) // ULID
  id: string;

  @Column({ type: 'varchar', length: 50 })
  clienteId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  supervisorId?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tecnicoId?: string | null;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: VisitaEstado, default: VisitaEstado.PENDIENTE })
  estado: VisitaEstado;

  @Column({ type: 'timestamptz', nullable: true })
  checkInAt?: Date | null;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  checkInLat?: number | null;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  checkInLng?: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutAt?: Date | null;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  checkOutLat?: number | null;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  checkOutLng?: number | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  notaSupervisor?: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  notaTecnico?: string | null;

  @Column({ type: 'int', nullable: true })
  duracionMin?: number | null;

  @ManyToOne(() => Cliente, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supervisorId' })
  supervisor?: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tecnicoId' })
  tecnico?: Usuario | null;

  @OneToMany(() => EventoVisita, (ev) => ev.visita, { cascade: true })
  eventos: EventoVisita[];

  @OneToMany(() => Evidencia, (ev) => ev.visita, { cascade: true })
  evidencias: Evidencia[];

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  actualizadoEn: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  eliminadoEn?: Date | null;
}
