import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/common/enums/applicationStatus';

export class UpdateApplicationStatusDto {
    @ApiProperty({ enum: ApplicationStatus })
    status: ApplicationStatus;
}
