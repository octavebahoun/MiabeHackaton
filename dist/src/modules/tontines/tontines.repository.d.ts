import { Repository } from 'typeorm';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';
export declare class TontinesRepository {
    readonly tontineRepo: Repository<Tontine>;
    readonly memberRepo: Repository<TontineMember>;
    constructor(tontineRepo: Repository<Tontine>, memberRepo: Repository<TontineMember>);
}
