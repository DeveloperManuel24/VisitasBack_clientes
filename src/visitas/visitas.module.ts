// src/visitas/visitas.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { VisitasController } from './visitas.controller'
import { VisitasService } from './visitas.service'

import { Visita } from './entities/visita.entity'
import { EventoVisita } from './entities/evento-visita.entity'
import { Evidencia } from './entities/evidencia.entity'
import { Usuario } from '../visitas/entities/usuario.entity'
import { Cliente } from '../clientes/entities/cliente.entity'

import { GmailModule } from '../gmail/gmail.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Visita,
      EventoVisita,
      Evidencia,
      Usuario,
      Cliente,
    ]),
    GmailModule, // <- para poder inyectar GmailService en VisitasService
  ],
  controllers: [VisitasController],
  providers: [VisitasService],
  exports: [VisitasService],
})
export class VisitasModule {}
