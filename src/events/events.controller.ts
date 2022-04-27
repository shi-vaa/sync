import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import constants from 'docs/constants';
import { BadRequestDTO } from 'project/dtos/error';
import { GetEventsDTO } from './dtos/get-events';
import { EventsService } from './events.service';

@Controller('events')
@ApiTags('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('/:projectId')
  @ApiOkResponse({
    description: constants.OK.description,
    type: GetEventsDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async getEvents(@Param() getEventsDto: GetEventsDTO) {
    try {
      const { projectId } = getEventsDto;

      return await this.eventsService.getEvents(projectId);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
