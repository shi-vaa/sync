import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import constants from 'docs/constants';
import { logger } from 'ethers';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { BadRequestDTO } from 'project/dtos/error';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { ContractService } from './contract.service';
import { AddContractDTO } from './dtos/add-contract';
import { RemoveContractDTO } from './dtos/remove-contract';

@Controller('contracts')
@ApiTags('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    private readonly logger: PinoLoggerService,
  ) {}

  @Post('')
  @ApiHeader({ name: 'app_id', example: '' })
  @ApiOkResponse({
    description: constants.OK.description,
    type: AddContractDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async addContract(@Body() addContractDto: AddContractDTO, @Req() req) {
    try {
      const {
        abi,
        projectId,
        webhook_url,
        contract_address,
        chain_id,
        fromBlock,
        blockRange,
      } = addContractDto;

      logger.info(req.headers);

      if (!req.headers?.app_id) {
        throw new BadRequestException(Messages.AppIdRequired);
      }

      if (
        !(await this.projectService.validateAppId(
          req.headers.app_id,
          null,
          projectId,
        ))
      ) {
        throw new Error(Messages.IncorrectAppId);
      }

      await this.contractService.addContract(
        abi,
        projectId,
        webhook_url,
        contract_address,
        chain_id,
        fromBlock,
        blockRange,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('')
  @ApiHeader({ name: 'app_id', example: '' })
  @ApiOkResponse({
    description: constants.OK.description,
    type: RemoveContractDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async removeContract(
    @Body() removeContractDTO: RemoveContractDTO,
    @Req() req,
  ) {
    try {
      const { projectId, contract_address } = removeContractDTO;

      if (!req.headers?.app_id) {
        throw new BadRequestException(Messages.AppIdRequired);
      }

      if (
        !(await this.projectService.validateAppId(
          req.headers.app_id,
          null,
          projectId,
        ))
      ) {
        throw new Error(Messages.IncorrectAppId);
      }

      await this.contractService.removeContract(contract_address);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
