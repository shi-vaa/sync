import { Controller, Get, Inject, Req } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('test')
  test(@Req() req) {
    const { projectName } = req.query;

    const ERC20_ABI = [
      'event Listed(address nft, uint256 nftId, address seller, uint256 price)',
    ];

    return this.eventsService.test(
      '0xD68603215c4646386d2e0bE68a38027CE4a7652d',
      ERC20_ABI,
      projectName,
    );
  }
}
