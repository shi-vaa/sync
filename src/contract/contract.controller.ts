import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import constants from 'docs/constants';
import { BadRequestDTO } from 'project/dtos/error';
import { ContractService } from './contract.service';
import { AddContractDTO } from './dtos/add-contract';

@Controller('contracts')
@ApiTags('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('')
  //add auth - token
  @ApiOkResponse({
    description: constants.OK.description,
    type: AddContractDTO,
  })
  @ApiBadRequestResponse({
    description: constants.BAD_REQUEST.description,
    type: BadRequestDTO,
  })
  async addContract(@Body() addContractDto: AddContractDTO) {
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

  //add APIs
  async removeContract() {}

  async getContractsForProject() {}
}
