import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tontine } from '../tontines/entities/tontine.entity';
import { NotFoundException } from '@nestjs/common';
import { Contribution } from '../contributions/entities/contribution.entity';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
  ) {}

  /**
   * GET /blockchain/status
   * Statut de connexion au réseau Polygon (public)
   */
  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Statut de la connexion au réseau Polygon' })
  async getNetworkStatus() {
    const blockNumber = await this.blockchainService.getBlockNumber();
    return { network: 'polygon-mumbai', connected: true, block_number: blockNumber };
  }

  /**
   * GET /blockchain/tontine/:tontineId
   * État du smart contract d'une tontine via son ID (on résout l'adresse en DB)
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tontine/:tontineId')
  @ApiOperation({ summary: 'État on-chain du smart contract d\'une tontine (MEMBER)' })
  @ApiResponse({ status: 200, description: 'Données blockchain retournées' })
  @ApiResponse({ status: 404, description: 'Tontine ou contrat introuvable' })
  async getTontineState(@Param('tontineId') tontineId: string) {
    const tontine = await this.tontineRepo.findOne({ where: { id: tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (!tontine.contract_address) {
      return { tontine_id: tontineId, status: 'CONTRACT_NOT_DEPLOYED', message: 'Le smart contract n\'a pas encore été déployé' };
    }
    return this.blockchainService.getTontineState(tontine.contract_address);
  }

  /**
   * GET /blockchain/contribution/:id/proof
   * Vérifier qu'une preuve de cotisation existe on-chain via l'ID de la contribution
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('contribution/:id/proof')
  @ApiOperation({ summary: 'Vérifier une preuve de cotisation on-chain (JWT)' })
  @ApiResponse({ status: 200, description: '{ verified, tx_hash, proof_hash }' })
  async verifyContributionProof(@Param('id') contributionId: string) {
    const contribution = await this.contributionRepo.findOne({ where: { id: contributionId } });
    if (!contribution) throw new NotFoundException('Contribution introuvable');

    return {
      contribution_id: contributionId,
      blockchain_confirmed: contribution.blockchain_confirmed,
      blockchain_tx_hash: contribution.blockchain_tx_hash,
      proof_hash: contribution.proof_hash,
      verified: contribution.blockchain_confirmed && !!contribution.blockchain_tx_hash,
    };
  }
}
