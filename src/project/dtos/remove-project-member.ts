import { ApiProperty } from '@nestjs/swagger';

export class RemoveProjectMemberDTO {
  @ApiProperty()
  projectId: string;

  @ApiProperty()
  memberId: string;
}
