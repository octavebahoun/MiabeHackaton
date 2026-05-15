import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';

@Injectable()
export class TontinesRepository {
  constructor(
    @InjectRepository(Tontine)
    public readonly tontineRepo: Repository<Tontine>,
    
    @InjectRepository(TontineMember)
    public readonly memberRepo: Repository<TontineMember>,
  ) {}
}
