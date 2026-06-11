import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSensorDeviceDto {
  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;
}
