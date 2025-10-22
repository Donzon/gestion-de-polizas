import { Injectable } from '@nestjs/common';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async getHealthStatus(): Promise<HealthCheckResult> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
