import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Visita } from './visita.entity';
import { EventoVisitaTipo } from '../enums/visita.enums';

@Entity('evento_visita')
@Index('idx_evento_visita_visita', ['visitaId'])
@Index('idx_evento_visita_tipo', ['tipo'])
export class EventoVisita {
  @PrimaryColumn({ type: 'varchar', length: 50 }) // ULID
  id: string;

  @Column({ type: 'varchar', length: 50 })
  visitaId: string;

  @ManyToOne(() => Visita, (v) => v.eventos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitaId' })
  visita: Visita;

  @Column({ type: 'enum', enum: EventoVisitaTipo })
  tipo: EventoVisitaTipo;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any> | null;
}
