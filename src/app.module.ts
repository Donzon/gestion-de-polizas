import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoliciesModule } from './policies/policies.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PoliciesModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
