import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private repository: Repository<Entity>) {}

  create(createDto: Entity) {
    return this.repository.save(createDto);
  }

  findAll(options: FindManyOptions<Entity> = {}) {
    return this.repository.find(options);
  }

  findOneById(id: string, options: Omit<FindOneOptions<Entity>, 'where'> = {}) {
    return this.repository.findOne({
      where: { id },
      ...options,
    } as unknown as FindOneOptions<Entity>);
  }

  findOneByIdOrFail(id: string) {
    return this.repository.findOneByOrFail({
      id,
    } as unknown as FindOptionsWhere<Entity>);
  }

  async update(id: string, updateDto: QueryDeepPartialEntity<Entity>) {
    await this.findOneByIdOrFail(id);

    return await this.repository.update(id, updateDto);
  }

  async remove(id: string) {
    await this.findOneByIdOrFail(id);

    return await this.repository.delete(id);
  }
}
