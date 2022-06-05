import { Controller } from '@nestjs/common';
import { BaseControllerFactory } from 'src/base/base-controller.factory';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';
import { SpaceService } from './space.service';

@Controller('spaces')
export class SpaceController extends BaseControllerFactory<
  Space,
  CreateSpaceDto,
  UpdateSpaceDto
>(CreateSpaceDto, UpdateSpaceDto) {
  constructor(private readonly spaceService: SpaceService) {
    super(spaceService);
  }
}
