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
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController extends BaseController<
  Prisma.VehicleDelegate<Prisma.PrismaClientOptions['rejectOnNotFound']>
> {
  constructor(private readonly vehicleService: VehicleService) {
    super(vehicleService);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return super.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return super.delete(id);
  }
}
