import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import constants from 'docs/constants';
import { BadRequestDTO } from 'project/dtos/error';
import { Messages } from 'utils/constants';
import { SyncEventsDTO } from './dtos/sync-events';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
}
