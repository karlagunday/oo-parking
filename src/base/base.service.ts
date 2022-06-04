import { FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<
  Entity extends BaseEntity,
  CreateDto extends Partial<Entity>,
  UpdateDto extends Partial<Entity>,
> {
  constructor(private repository: Repository<Entity>) {}

  create(createDto: CreateDto) {
    return this.repository.save(createDto as unknown as Entity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneByOrFail({
      id,
    } as unknown as FindOptionsWhere<Entity>);
  }

  async update(id: string, updateDto: UpdateDto) {
    await this.findOne(id);

    return await this.repository.update(
      id,
      updateDto as unknown as QueryDeepPartialEntity<Entity>,
    );
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.repository.delete(id);
  }
}
