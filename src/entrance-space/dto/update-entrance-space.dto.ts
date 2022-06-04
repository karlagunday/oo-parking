import { PartialType } from '@nestjs/mapped-types';
import { CreateEntranceSpaceDto } from './create-entrance-space.dto';

export class UpdateEntranceSpaceDto extends PartialType(CreateEntranceSpaceDto) {}
