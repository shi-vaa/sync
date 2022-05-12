import { ApiProperty } from '@nestjs/swagger';

export class GetAppIdDTO {
  @ApiProperty()
  projectId: string;
}
