import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

// Allowed forward transitions. Anything not listed here is rejected.
// completed / failed are terminal states with no outgoing transitions.
const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: [],
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      title: dto.title.trim(),
      type: dto.type.trim(),
      status: JobStatus.PENDING,
    });
    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return job;
  }

  /**
   * Updates a job's status while enforcing the allowed state machine and
   * protecting against concurrent updates (e.g. two browser tabs both
   * trying to move the same "pending" job to "running").
   *
   * Strategy: "conditional update" (an optimistic-concurrency pattern).
   * We read the job to find its current status, validate the requested
   * transition against that status, and then issue an UPDATE that only
   * succeeds if the row's status *in the database* still matches the
   * status we read (`WHERE id = :id AND status = :expectedStatus`).
   *
   * If another request has already changed the status in the meantime,
   * the WHERE clause matches zero rows, affected = 0, and we know a race
   * occurred. We reload the row and return a 409 Conflict with the
   * current state instead of silently overwriting it. This all happens
   * at the database level, so it holds even if a client bypasses the
   * frontend and calls the API directly.
   */
  async updateStatus(id: string, dto: UpdateJobStatusDto): Promise<Job> {
    const job = await this.findOne(id);
    const currentStatus = job.status;
    const nextStatus = dto.status;

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} → ${nextStatus}`,
      );
    }

    const result = await this.jobsRepository
      .createQueryBuilder()
      .update(Job)
      .set({ status: nextStatus })
      .where('id = :id', { id })
      .andWhere('status = :currentStatus', { currentStatus })
      .execute();

    const affected = result.affected ?? 0;

    if (affected === 0) {
      // Someone else changed (or deleted) this job between our read and
      // our write. Tell the caller so the UI can refresh and retry.
      const latest = await this.jobsRepository.findOne({ where: { id } });
      if (!latest) {
        throw new NotFoundException(`Job with id ${id} not found`);
      }
      throw new ConflictException(
        `Job status was changed concurrently (now "${latest.status}"). Please refresh and try again.`,
      );
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
  }
}
