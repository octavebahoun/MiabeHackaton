import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { BlockchainService }    from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { BlockchainWorker }     from './workers/blockchain.worker';
import { Contribution }         from '../contributions/entities/contribution.entity';
import { Tontine }              from '../tontines/entities/tontine.entity';

@Module({
  imports: [
    // Entités nécessaires au worker pour mettre à jour la DB
    TypeOrmModule.forFeature([Contribution, Tontine]),

    // Déclaration de la queue consommée par le worker
    BullModule.registerQueue({ name: 'blockchain-queue' }),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService, BlockchainWorker],
  exports: [BlockchainService],
})
export class BlockchainModule {}
