import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { EntranceSpaceService } from 'src/entrance-space/entrance-space.service';
import { SpaceService } from 'src/space/space.service';
import { Repository } from 'typeorm';
import { EntranceSpace } from '../entrance-space/entities/entrance-space.entity';
import { AssignSpaceDto } from './dto/add-space.dto';
import { Entrance } from './entities/entrance.entity';

@Injectable()
export class EntranceService extends BaseService<Entrance> {
  constructor(
    @Inject(Entrance.name)
    private entranceRepository: Repository<Entrance>,
    private spaceService: SpaceService,
    private entranceSpaceService: EntranceSpaceService,
  ) {
    super(entranceRepository);
  }

  async assignSpaceById(
    entranceId: string,
    { spaceId, distance }: AssignSpaceDto,
  ) {
    const entrance = await this.findOneById(entranceId);
    if (!entrance) {
      throw new NotFoundException('Entrance not found');
    }

    const space = await this.spaceService.findOneById(spaceId);
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const existingSpaceIds = entrance.spaces.map(({ id }) => id);
    if (existingSpaceIds.includes(spaceId)) {
      throw new BadRequestException('Space already assigned to the entrance');
    }

    return await this.entranceSpaceService.create(
      EntranceSpace.construct({
        entranceId,
        spaceId,
        distance,
      }),
    );
  }
}
