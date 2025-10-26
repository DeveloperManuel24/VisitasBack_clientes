// src/gmail/gmail.module.ts
import { Module } from '@nestjs/common'
import { GmailService } from './gmail.service'

@Module({
  providers: [GmailService],
  exports: [GmailService], // <- esto permite que otros módulos (VisitasModule) lo usen
})
export class GmailModule {}
