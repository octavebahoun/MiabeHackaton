import {
  Controller, Post, Get, Body, Param,
  UseGuards, Ip, HttpCode, HttpStatus, Headers, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ContributionsService } from './contributions.service';
import { CyclesService } from '../cycles/cycles.service';
import { InitiateContributionDto } from './dto/initiate-contribution.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { NotFoundException, ConflictException } from '@nestjs/common';

@ApiTags('Contributions')
@Controller('contributions')
export class ContributionsController {
  constructor(
    private readonly contributionsService: ContributionsService,
    private readonly cyclesService: CyclesService,
  ) {}

  /**
   * POST /contributions/initiate
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  @ApiOperation({ summary: 'Initier un paiement Mobile Money via FedaPay' })
  @ApiResponse({ status: 201, description: 'Lien de paiement FedaPay retourné' })
  async initiate(@CurrentUser() user: any, @Body() dto: InitiateContributionDto) {
    const cycle = await this.cyclesService.findById(dto.cycle_id);
    if (!cycle) throw new NotFoundException('Cycle introuvable');
    if (cycle.status !== 'ACTIVE') throw new ConflictException('Ce cycle n\'est pas actif');

    const cycleRef = {
      id:                  cycle.id,
      tontine_id:          cycle.tontine_id,
      status:              cycle.status,
      contribution_amount: Number(cycle.tontine?.contribution_amount ?? 0),
    };

    return this.contributionsService.initiate(user.sub, dto, cycleRef);
  }

  /**
   * POST /contributions/webhook/fedapay
   * Endpoint public — sécurisé par signature HMAC-SHA256 dans le header x-fedapay-signature
   *
   * ⚠️ On a besoin du rawBody (string brut) pour la vérification de signature.
   *    NestJS parse automatiquement le JSON, on récupère le body brut via express.
   */
  @Public()
  @Post('webhook/fedapay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook FedaPay (signature HMAC-SHA256 via header)' })
  async fedapayWebhook(
    @Req() req: Request,
    @Body() payload: any,
    @Headers('x-fedapay-signature') signature: string,
  ) {
    // Récupérer le body brut pour la vérification HMAC
    const rawBody = (req as any).rawBody ?? JSON.stringify(payload);

    await this.contributionsService.handleFedaPayWebhook(payload, rawBody, signature);
    return { received: true };
  }

  /**
   * GET /contributions/cycle/:cycleId
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cycle/:cycleId')
  @ApiOperation({ summary: 'Cotisations d\'un cycle donné' })
  async findByCycle(@Param('cycleId') cycleId: string) {
    return this.contributionsService.findByCycle(cycleId);
  }

  /**
   * GET /contributions/my
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiOperation({ summary: 'Mon historique de cotisations' })
  async findMyHistory(@CurrentUser() user: any) {
    return this.contributionsService.findMyHistory(user.sub);
  }
}
