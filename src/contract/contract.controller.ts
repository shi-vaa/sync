import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IAbi } from 'utils/interfaces/abi';
import { ContractService } from './contract.service';
import { AddContractDTO } from './dtos/add-contract';

@Controller('contracts')
@ApiTags('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('add')
  //add api keys and auth
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
}
