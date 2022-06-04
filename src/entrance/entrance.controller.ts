import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { UpdateEntranceDto } from './dto/update-entrance.dto';
import { Entrance } from './entities/entrance.entity';
import { EntranceService } from './entrance.service';

@Controller('entrances')
export class EntranceController extends BaseController<
  Entrance,
  CreateEntranceDto,
  UpdateEntranceDto,
  EntranceService
> {
  constructor(private readonly entranceService: EntranceService) {
    super(entranceService);
  }
}
