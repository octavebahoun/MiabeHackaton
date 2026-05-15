import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersRepository {
    private readonly repo;
    constructor(repo: Repository<User>);
    findByPhone(phone: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    updateById(id: string, data: Partial<User>): Promise<void>;
}
