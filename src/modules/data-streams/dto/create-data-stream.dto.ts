import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDataStreamDto {
  @ApiProperty({ example: 'temperature' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(999999)
  unitId!: number;
}
