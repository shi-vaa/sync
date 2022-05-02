import { ApiHeader, ApiProperty } from '@nestjs/swagger';

export class ProjectDetailsDTO {
  @ApiProperty()
  projectName: string;

}
