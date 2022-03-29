import { ApiProperty } from '@nestjs/swagger';

export class AddProjectMemberDTO {
  @ApiProperty()
  projectId: string;

  @ApiProperty()
  memberId: string;
}
