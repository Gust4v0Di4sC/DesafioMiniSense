import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PublishSensorDataDto {
  @ApiProperty({ example: 1506521102 })
  @IsInt()
  @Min(0)
  timestamp!: number;

  @ApiProperty({ example: 28.5 })
  @IsNumber()
  value!: number;
}
