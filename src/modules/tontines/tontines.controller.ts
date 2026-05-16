import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TontinesService } from './tontines.service';
import { CyclesService } from '../cycles/cycles.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JoinTontineDto } from './dto/join-tontine.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tontines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tontines')
export class TontinesController {
  constructor(
    private readonly tontinesService: TontinesService,
    private readonly cyclesService: CyclesService,
  ) {}

  @Post()
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une nouvelle tontine' })
  async create(@CurrentUser() user: any, @Body() dto: CreateTontineDto) {
    return this.tontinesService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tontines auxquelles je participe' })
  async findMyTontines(@CurrentUser() user: any) {
    return this.tontinesService.findMyTontines(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une tontine' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tontinesService.findById(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tontine' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateTontineDto) {
    return this.tontinesService.update(id, user.sub, dto);
  }

  // ==========================================
  // NOUVELLES APIS (CYCLE DE VIE ET MEMBRES)
  // ==========================================

  @Post(':id/open')
  @ApiOperation({ summary: 'Ouvrir la tontine aux inscriptions (ORGANIZER)' })
  @ApiResponse({ status: 200, description: 'Statut passé à OPEN' })
  async open(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tontinesService.open(id, user.sub);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Démarrer la tontine + déploiement smart contract (ORGANIZER)' })
  @ApiResponse({ status: 200, description: 'Tontine active, déploiement asynchrone lancé' })
  async start(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tontinesService.start(id, user.sub);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre une tontine via son code d\'invitation (USER)' })
  @ApiResponse({ status: 201, description: 'Demande envoyée, statut PENDING' })
  async join(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: JoinTontineDto) {
    return this.tontinesService.join(user.sub, id, dto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Lister tous les membres de la tontine (MEMBER)' })
  async getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tontinesService.getMembers(id, user.sub);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Valider ou rejeter la demande d\'un membre (ORGANIZER)' })
  async updateMemberStatus(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateMemberDto
  ) {
    return this.tontinesService.updateMemberStatus(id, memberId, user.sub, dto.status);
  }

  /** GET /tontines/:id/cycles — Tous les cycles d'une tontine (MEMBER) */
  @Get(':id/cycles')
  @ApiOperation({ summary: 'Tous les cycles d\'une tontine avec leur statut' })
  @ApiResponse({ status: 200, description: 'Liste ordonnée des cycles' })
  async getCycles(@Param('id') id: string, @CurrentUser() user: any) {
    // Vérification d'appartenance avant de retourner les cycles
    await this.tontinesService.findById(id, user.sub); // lève ForbiddenException si non-membre
    return this.cyclesService.findByTontine(id);
  }
}
