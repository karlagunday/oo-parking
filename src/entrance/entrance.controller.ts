import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseController } from 'src/base/base.controller';
import { CreateEntranceDto, UpdateEntranceDto } from './dto/entrance.dto';
import { EntranceService } from './entrance.service';

@Controller('entrances')
export class EntranceController extends BaseController<
  Prisma.EntranceDelegate<Prisma.PrismaClientOptions['rejectOnNotFound']>
> {
  constructor(private readonly entranceService: EntranceService) {
    super(entranceService);
  }

  @Post()
  create(@Body() dto: CreateEntranceDto) {
    return super.create(dto);
  }

  @Get()
  retrieveAll() {
    return super.retrieveAll();
  }

  @Get(':id')
  retrieveById(@Param('id', ParseIntPipe) id: number) {
    return super.retrieveById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntranceDto,
  ) {
    return super.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return super.delete(id);
  }
}
