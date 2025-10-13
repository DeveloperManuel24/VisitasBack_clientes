import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Visita } from './visita.entity';
import { EvidenciaTipo } from '../enums/visita.enums';

@Entity('evidencia')
@Index('idx_evidencia_visita', ['visitaId'])
@Index('idx_evidencia_tipo', ['tipo'])
export class Evidencia {
  @PrimaryColumn({ type: 'varchar', length: 50 }) // ULID
  id: string;

  @Column({ type: 'varchar', length: 50 })
  visitaId: string;

  @ManyToOne(() => Visita, (v) => v.evidencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitaId' })
  visita: Visita;

  @Column({ type: 'enum', enum: EvidenciaTipo })
  tipo: EvidenciaTipo;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
