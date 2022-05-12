import {
  Body,
  Controller,
  Post,
  InternalServerErrorException,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/decorators/roles.enum';
import constants from 'docs/constants';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { GetNFTsDTO } from './dtos/get-nfts';
import { GetNftsParamsDTO } from './dtos/get-nfts-params';

import { NftService } from './nft.service';

@Controller('nfts')
@ApiTags('NFTs')
export class NftController {
  constructor(
    private nftService: NftService,
    private projectService: ProjectService,
  ) {}

  @Post(':contract_address')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiHeader({ name: 'app-id', example: '' })
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
      const { rpc, projectId, fromBlock } = getNftsDto;
      const { contract_address } = getNftsParamsDTO;

      if (!req.headers['app-id']) {
        throw new BadRequestException(Messages.AppIdRequired);
      }

      if (
        !(await this.projectService.validateAppId(
          req.headers['app-id'],
          null,
          projectId,
        ))
      ) {
        throw new Error(Messages.IncorrectAppId);
      }

      const nfts = await this.nftService.getNfts(
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
