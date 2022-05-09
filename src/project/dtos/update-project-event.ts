import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDTO {
  @ApiProperty()
  projectId: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  event: {
    topic?: string;
    webhook_url?: string;
    fromBlock?: number;
    blockRange?: number;
    abi?: any;
  };
}
