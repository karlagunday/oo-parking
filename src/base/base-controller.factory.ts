import {
  Body,
  ClassSerializerInterceptor,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Type,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { TypeOrmErrorExceptionFilter } from 'src/filters/typeorm-error.filter';
import { BaseValidationPipe } from './base-validation.pipe';
import { BaseEntity } from './base.entity';
import { BaseInterface } from './base.interface';
import { BaseService } from './base.service';

/**
 * Workaround to allow inherited types to be validated
 * see: https://stackoverflow.com/questions/71394797/nestjs-reusable-controller-with-validation/71396211#71396211
 */
export function BaseControllerFactory<
  Entity extends BaseEntity,
  CreateDto,
  UpdateDto,
>(
  createDto: Type<CreateDto>,
  updateDto: Type<UpdateDto>,
): Type<BaseInterface<Entity, CreateDto, UpdateDto>> {
  const createPipe = new BaseValidationPipe(
    { whitelist: true, transform: true },
    { body: createDto },
  );
  const updatePipe = new BaseValidationPipe(
    { whitelist: true, transform: true },
    { body: updateDto },
  );

  @UseFilters(new TypeOrmErrorExceptionFilter())
  @UseInterceptors(ClassSerializerInterceptor)
  class CrudController<Entity extends BaseEntity, CreateDto, UpdateDto>
    implements BaseInterface<Entity, CreateDto, UpdateDto>
  {
    constructor(private service: BaseService<Entity>) {}

    @Post()
    @UsePipes(createPipe)
    create(@Body() createDto: CreateDto) {
      return this.service.create(createDto as unknown as Entity);
    }

    @Get()
    findAll() {
      return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.service.findOneByIdOrFail(id);
    }

    @Patch(':id')
    @UsePipes(updatePipe)
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateDto: UpdateDto,
    ) {
      return this.service.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.service.remove(id);
    }
  }

  return CrudController;
}
