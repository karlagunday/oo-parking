import { FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private repository: Repository<Entity>) {}

  create(createDto: Entity) {
    return this.repository.save(createDto);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneByOrFail({
      id,
    } as unknown as FindOptionsWhere<Entity>);
  }

  async update(id: string, updateDto: QueryDeepPartialEntity<Entity>) {
    await this.findOne(id);

    return await this.repository.update(id, updateDto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.repository.delete(id);
  }
}
