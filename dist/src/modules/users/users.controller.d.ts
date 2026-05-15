import { UsersService } from './users.service';
import { User } from './entities/user.entity';
declare class UpdateProfileDto {
    full_name?: string;
    email?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<any>;
    updateMe(user: User, dto: UpdateProfileDto): Promise<User>;
}
export {};
