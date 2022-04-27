import {
  Body,
  Controller,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import constants from 'docs/constants';
import { BadRequestDTO } from 'project/dtos/error';
import { GetNFTsDTO } from './dtos/Get-nfts';
import { NftService } from './nft.service';

@Controller('nfts')
@ApiTags('NFT')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post()
  @ApiOkResponse({
    description: constants.CREATED.description,
    type: GetNFTsDTO,
  })
  async getNfts(@Body() getNftsDto: GetNFTsDTO) {
    try {
      const { contract_address, rpc, projectId, fromBlockNumber } = getNftsDto;
      const nfts = await this.nftService.getNfts(
        contract_address,
        rpc,
        projectId,
        fromBlockNumber,
      );

      return nfts;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
