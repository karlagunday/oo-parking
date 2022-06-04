import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { TypeOrmErrorExceptionFilter } from 'src/filters/typeorm-error.filter';
import { BaseEntity } from './base.entity';
import { BaseService } from './base.service';

@UseFilters(new TypeOrmErrorExceptionFilter())
export abstract class BaseController<
  Entity extends BaseEntity,
  CreateDto,
  UpdateDto,
  Service extends BaseService<Entity, CreateDto, UpdateDto>,
> {
  constructor(private readonly service: Service) {}

  @Post()
  create(@Body() createDto: CreateDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
