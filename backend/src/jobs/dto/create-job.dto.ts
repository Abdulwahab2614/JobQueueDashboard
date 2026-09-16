import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(120, { message: 'Title must be under 120 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  @MinLength(2, { message: 'Type must be at least 2 characters' })
  @MaxLength(60, { message: 'Type must be under 60 characters' })
  type: string;
}
