import { ApiProperty } from '@nestjs/swagger';

export class ErrorDTO {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}

export class BadRequestDTO extends ErrorDTO {
  @ApiProperty({ default: 400 })
  statusCode: 400;

  @ApiProperty()
  message: 'Bad Request';
}
