import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';
import { SpaceService } from './space.service';

@Controller('spaces')
export class SpaceController extends BaseController<
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  SpaceService
> {
  constructor(private readonly spaceService: SpaceService) {
    super(spaceService);
  }
}
