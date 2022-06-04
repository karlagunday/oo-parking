import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseService } from 'src/base/base.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityLogService extends BaseService<
  Prisma.ActivityLogDelegate<Prisma.PrismaClientOptions['rejectOnNotFound']>
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.activityLog);
  }
}
