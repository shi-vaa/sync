import { ApiProperty } from '@nestjs/swagger';

export class GetEventsDTO {
  @ApiProperty()
  projectId: string;
}
