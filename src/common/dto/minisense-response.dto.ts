import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeasurementUnitResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '°C' })
  symbol!: string;

  @ApiProperty({ example: 'Celsius' })
  description!: string;
}

export class MeasurementResponseDto {
  @ApiPropertyOptional({ example: 123 })
  id?: number;

  @ApiProperty({ example: 1506521102 })
  timestamp!: number;

  @ApiProperty({ example: 28.5 })
  value!: number;

  @ApiPropertyOptional({ example: 1 })
  unitId?: number;
}

export class DataStreamResponseDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: '8961bd9a4d1e439ebf3b86af5b9d5c1f' })
  key!: string;

  @ApiProperty({ example: 'temperature' })
  label!: string;

  @ApiProperty({ example: 1 })
  unitId!: number;

  @ApiProperty({ example: 2 })
  deviceId!: number;

  @ApiProperty({ example: 19 })
  measurementCount!: number;

  @ApiPropertyOptional({ type: [MeasurementResponseDto] })
  measurements?: MeasurementResponseDto[];
}

export class SensorDeviceResponseDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: '27b26e48cd674cc38ec45808cf48fa07' })
  key!: string;

  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  label!: string;

  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  description!: string;

  @ApiProperty({ type: [DataStreamResponseDto] })
  streams!: DataStreamResponseDto[];
}

export class CreatedSensorDeviceResponseDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: '8961bd9a4d1e439ebf3b86af5b9d5c1f' })
  key!: string;

  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  label!: string;

  @ApiProperty({ example: "Kitchen's freezer sensor (Arduino)" })
  description!: string;
}
