import { CyclesService } from './cycles.service';
export declare class CyclesController {
    private readonly cyclesService;
    constructor(cyclesService: CyclesService);
    findOne(id: string): Promise<import("./entities/cycle.entity").Cycle>;
    getCurrentCycle(tontineId: string): Promise<import("./entities/cycle.entity").Cycle>;
    findByTontine(tontineId: string): Promise<import("./entities/cycle.entity").Cycle[]>;
}
