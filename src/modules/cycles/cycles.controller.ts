import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CyclesService }   from './cycles.service';
import { JwtAuthGuard }    from '../../common/guards/jwt-auth.guard';
import { CurrentUser }     from '../../common/decorators/current-user.decorator';

@ApiTags('Cycles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cycles')
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  /**
   * GET /cycles/:id
   * Détail d'un cycle avec son bénéficiaire
   */
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un cycle (bénéficiaire, montants, statut)' })
  async findOne(@Param('id') id: string) {
    return this.cyclesService.findById(id);
  }

  /**
   * GET /cycles/tontine/:tontineId/current
   * Cycle actuellement actif pour une tontine
   */
  @Get('tontine/:tontineId/current')
  @ApiOperation({ summary: 'Cycle actif d\'une tontine' })
  async getCurrentCycle(@Param('tontineId') tontineId: string) {
    return this.cyclesService.getCurrentCycle(tontineId);
  }

  /**
   * GET /cycles/tontine/:tontineId
   * Tous les cycles d'une tontine (état général de la rotation)
   */
  @Get('tontine/:tontineId')
  @ApiOperation({ summary: 'Tous les cycles d\'une tontine avec leur statut' })
  async findByTontine(@Param('tontineId') tontineId: string) {
    return this.cyclesService.findByTontine(tontineId);
  }
}
