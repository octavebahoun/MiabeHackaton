import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
