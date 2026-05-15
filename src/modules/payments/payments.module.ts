import { Module } from '@nestjs/common';
import { FedaPayAdapter } from './fedapay.adapter';

@Module({
  providers: [FedaPayAdapter],
  exports: [FedaPayAdapter],
})
export class PaymentsModule {}
