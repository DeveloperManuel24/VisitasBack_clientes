import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('cliente')
@Index(['nombre', 'direccion'])
@Index('idx_cliente_correo', ['correo'])
@Index('idx_cliente_nit', ['nit'])
export class Cliente {
  // PK manual basada en ULID (string de 26 caracteres)
@PrimaryColumn({ type: 'varchar', length: 50 })  // antes 26
id: string;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 200 })
  direccion: string;

  @Column({ length: 30, nullable: true })
  telefono?: string;

  @Column({ length: 120, nullable: true })
  correo?: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lat?: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lng?: number;

  @Column({ length: 20, nullable: true })
  nit?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  actualizadoEn: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  eliminadoEn?: Date;
}
