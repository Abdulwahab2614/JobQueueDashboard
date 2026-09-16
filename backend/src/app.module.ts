import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || 'job-queue.sqlite',
      entities: [Job],
      synchronize: true, // fine for this assignment's scope; would use migrations in a larger/production app
    }),
    JobsModule,
  ],
})
export class AppModule {}
