import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';

class ApiRootResponseDto {
  @ApiProperty({ example: 'MiniSense API' })
  name: string;

  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '/docs' })
  docs: string;

  @ApiProperty({
    example: [
      '/measurement-units',
      '/sensor-devices',
      '/sensor-devices/{deviceKey}',
      '/data-streams/{streamKey}',
    ],
  })
  endpoints: string[];
}

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Consultar informações básicas da API' })
  @ApiOkResponse({ type: ApiRootResponseDto })
  getRoot(): ApiRootResponseDto {
    return {
      name: 'MiniSense API',
      status: 'ok',
      docs: '/docs',
      endpoints: [
        '/measurement-units',
        '/sensor-devices',
        '/sensor-devices/{deviceKey}',
        '/data-streams/{streamKey}',
      ],
    };
  }
}
