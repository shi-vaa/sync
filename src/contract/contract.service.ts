import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventsModule } from 'events/events.module';
import { EventsService } from 'events/events.service';
import { PinoLoggerService } from 'logger/pino-logger.service';
import { Model } from 'mongoose';
import { ProjectModule } from 'project/project.module';
import { ProjectService } from 'project/project.service';
import { Messages } from 'utils/constants';
import { abiType, IAbi } from 'utils/interfaces/abi';

import { ContractDocument } from './contract.schema';

@Injectable()
export class ContractService {
  constructor(
    @InjectModel('Contract')
    private readonly contractModel: Model<ContractDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    private readonly eventsService: EventsService,
    private readonly logger: PinoLoggerService,
  ) {}

  space = ' ';

  async addContract(
    abi: IAbi[],
    projectId: string,
    webhook_url: string,
    contract_address: string,
    chain_id: number,
    fromBlock?: number,
    blockRange?: number,
  ) {
    try {
      const project = await this.projectService.findByProjectId(projectId);

      if (!project) {
        throw new Error(Messages.ProjectNotFound);
      }

      const newContract = new this.contractModel({
        projectId,
        contract_address,
        abi,
      });

      await newContract.save();

      for (const item of abi) {
        await this.createEventFromAbi(
          item,
          projectId,
          webhook_url,
          contract_address,
          chain_id,
          fromBlock,
          blockRange,
        );
      }
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  createTopic(abi: IAbi) {
    const { name, type, inputs } = abi;
    let topic = `${type} ${name}(`;

    inputs.forEach((input, index) => {
      const { indexed, name, type } = input;
      const isLastArg = index === inputs.length - 1;

      topic += type;
      if (indexed) {
        topic += ' indexed';
      }
      topic += this.space + name;
      if (!isLastArg) {
        topic += ',';
      }
    });

    topic += ')';

    return topic;
  }

  createConstructor(abi: IAbi[]) {
    const hasConstructor = abi.find((obj) => obj.type === abiType.constructor);
    if (hasConstructor) {
      return;
    }
  }

  async createEventFromAbi(
    abi: IAbi,
    projectId: string,
    webhook_url: string,
    contract_address: string,
    chain_id: number,
    fromBlock?: number,
    blockRange?: number,
  ) {
    try {
      if (abi.type === abiType.event) {
        const { name } = abi;
        const topic = this.createTopic(abi);

        await this.eventsService.createEvent(
          name,
          topic,
          projectId,
          chain_id,
          contract_address,
          webhook_url,
          fromBlock,
          blockRange,
          abi,
        );
      }
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async removeContract(contract_address: string) {
    await this.contractModel.findOneAndDelete({ contract_address });
    await this.eventsService.removeEventsByContractAddress(contract_address);
  }

  async getContractsForProject(projectId: string): Promise<ContractDocument[]> {
    return this.contractModel.find({ projectId });
  }
}
