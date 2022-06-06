import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { BaseControllerFactory } from 'src/base/base-controller.factory';
import { AssignSpaceDto } from './dto/add-space.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { UpdateEntranceDto } from './dto/update-entrance.dto';
import { Entrance } from './entities/entrance.entity';
import { EntranceService } from './entrance.service';

@Controller('entrances')
@UseInterceptors(ClassSerializerInterceptor)
export class EntranceController extends BaseControllerFactory<
  Entrance,
  CreateEntranceDto,
  UpdateEntranceDto
>(CreateEntranceDto, UpdateEntranceDto) {
  constructor(private readonly entranceService: EntranceService) {
    super(entranceService);
  }

  @Post(':id/spaces/assign')
  assignSpace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignSpaceDto,
  ) {
    return this.entranceService.assignSpaceById(id, dto);
  }
}
