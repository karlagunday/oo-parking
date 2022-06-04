import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseService } from 'src/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleService extends BaseService<
  Prisma.VehicleDelegate<Prisma.PrismaClientOptions['rejectOnNotFound']>
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.vehicle);
  }
}
