import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a hello message to verify the gateway is running' })
  @ApiOkResponse({ description: 'Gateway is up', type: String })
  getHello(): string {
    return this.gatewayService.getHello();
  }
}
