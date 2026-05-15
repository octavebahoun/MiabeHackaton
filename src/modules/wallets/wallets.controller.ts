import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallets')
@Controller('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  /**
   * POST /wallets/create
   * Crée un wallet Polygon custodial pour l'utilisateur connecté.
   * La clé privée est chiffrée AES-256-GCM — jamais retournée.
   */
  @Post('create')
  @ApiOperation({ summary: 'Créer un wallet Polygon custodial' })
  @ApiResponse({ status: 201, description: 'Wallet créé, adresse publique retournée' })
  @ApiResponse({ status: 409, description: 'Un wallet existe déjà pour cet utilisateur' })
  async create(@CurrentUser() user: any) {
    return this.walletsService.createWallet(user.sub);
  }

  /**
   * GET /wallets/balance
   * Retourne le solde MATIC du wallet de l'utilisateur via le RPC Polygon.
   */
  @Get('balance')
  @ApiOperation({ summary: 'Solde MATIC du wallet Polygon de l\'utilisateur' })
  @ApiResponse({ status: 200, description: '{ wallet_address, balance_matic, network }' })
  @ApiResponse({ status: 404, description: 'Aucun wallet trouvé — créer d\'abord via POST /wallets/create' })
  async getBalance(@CurrentUser() user: any) {
    return this.walletsService.getBalance(user.sub);
  }
}
