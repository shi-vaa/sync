import { ApiProperty } from '@nestjs/swagger';

export class ProjectDetailsDTO {
  @ApiProperty()
  projectId: string;
}
