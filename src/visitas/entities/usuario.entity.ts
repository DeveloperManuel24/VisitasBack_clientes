import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('usuario')
@Index('uq_usuario_email_active', ['email'], {
  unique: true,
  where: '"eliminadoEn" IS NULL', // unique solo para usuarios activos
})
@Index('idx_usuario_supervisor', ['supervisorId'])
export class Usuario {
  @PrimaryColumn({ type: 'varchar', length: 50 }) // ULID
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 160,
    transformer: {
      to: (v?: string) => (v ?? '').trim().toLowerCase(), // normaliza email al guardar
      from: (v?: string) => v ?? '',
    },
  })
  email: string;

  @Column({ type: 'varchar', length: 200 })
  hash: string; // bcrypt hash

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  supervisorId?: string | null;

  @ManyToOne(() => Usuario, (u) => u.subordinados, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'supervisorId' })
  supervisor?: Usuario | null;

  @OneToMany(() => Usuario, (u) => u.supervisor)
  subordinados: Usuario[];

  // Nota: NO hay relación con roles en este microservicio

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  actualizadoEn: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  eliminadoEn?: Date;
}
