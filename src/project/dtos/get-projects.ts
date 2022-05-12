import { ApiProperty } from '@nestjs/swagger';
import { ProjectDocument } from 'project/project.schema';

export class GetProjectsDTO {
  @ApiProperty()
  projects: ProjectDocument[];
}
