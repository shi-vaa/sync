import {
  Body,
  Controller,
  Post,
  InternalServerErrorException,
  UseGuards,
  Req,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'auth/auth.guard';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import { JwtGuard } from 'auth/guards/jwt.guard';
import constants from 'docs/constants';
import { UserService } from 'user/user.service';
import { Messages } from 'utils/constants';
import { GetNFTsDTO } from './dtos/get-nfts';
import { GetNftsParamsDTO } from './dtos/get-nfts-params';

import { NftService } from './nft.service';

@Controller('nfts')
@ApiTags('NFT')
export class NftController {
  constructor(
    private nftService: NftService,
    private userService: UserService,
  ) {}

  @Post(':contract_address')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOkResponse({
    description: constants.CREATED.description,
    type: GetNFTsDTO,
  })
  async getNfts(
    @Param() getNftsParamsDTO: GetNftsParamsDTO,
    @Body() getNftsDto: GetNFTsDTO,
    @Req() req,
  ) {
    try {
      if (!req.headers['x-api-key']) {
        throw new UnauthorizedException(Messages.ApiKeyRequired);
      }

      const userId = await this.userService.getUserIdFromApiKey(
        req.headers['x-api-key'],
      );

      const { rpc, projectId, fromBlock } = getNftsDto;
      const { contract_address } = getNftsParamsDTO;
      const nfts = await this.nftService.getNfts(
        userId.toString(),
        projectId,
        contract_address,
        rpc,
        fromBlock,
      );

      return nfts;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
