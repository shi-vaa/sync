import {
  Body,
  Controller,
  Post,
  InternalServerErrorException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'auth/auth.guard';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import { JwtGuard } from 'auth/guards/jwt.guard';
import constants from 'docs/constants';
import { GetNFTsDTO } from './dtos/get-nfts';

import { NftService } from './nft.service';

@Controller('nfts')
@ApiTags('NFT')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post()
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard, JwtGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOkResponse({
    description: constants.CREATED.description,
    type: GetNFTsDTO,
  })
  async getNfts(@Body() getNftsDto: GetNFTsDTO, @Req() req) {
    try {
      const { contract_address, rpc, projectId, fromBlockNumber } = getNftsDto;
      const nfts = await this.nftService.getNfts(
        req?.user.id,
        projectId,
        contract_address,
        rpc,
        fromBlockNumber,
      );

      return nfts;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
