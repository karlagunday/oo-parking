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
import { CreateSpaceDto, UpdateSpaceDto } from './dto';
import { SpaceService } from './space.service';

/**
 * Tried abstracting away everything but this is the minimum version where it works
 * Would've loved to just pass a generic service, DTO and let the base service
 * handle all the dependency injection, pipe validation.
 *
 * If the execution has no validation errors, it works. But if there are validation errors,
 * It just returns a generic error and seems to not execute the validation pipe
 *
 * Settling with this version for now
 */

@Controller('spaces')
export class SpaceController extends BaseController<
  Prisma.SpaceDelegate<Prisma.PrismaClientOptions['rejectOnNotFound']>
> {
  constructor(private readonly spaceService: SpaceService) {
    super(spaceService);
  }

  @Post()
  create(@Body() dto: CreateSpaceDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpaceDto) {
    return super.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return super.delete(id);
  }
}
