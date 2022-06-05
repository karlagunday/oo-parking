import { Controller } from '@nestjs/common';
import { BaseControllerFactory } from 'src/base/base-controller.factory';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { UpdateEntranceDto } from './dto/update-entrance.dto';
import { Entrance } from './entities/entrance.entity';
import { EntranceService } from './entrance.service';

@Controller('entrances')
export class EntranceController extends BaseControllerFactory<
  Entrance,
  CreateEntranceDto,
  UpdateEntranceDto
>(CreateEntranceDto, UpdateEntranceDto) {
  constructor(private readonly entranceService: EntranceService) {
    super(entranceService);
  }
}
