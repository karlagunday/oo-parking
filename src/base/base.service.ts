import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

export abstract class BaseService<Entity extends BaseEntity> {
  constructor(private repository: Repository<Entity>) {}

  /**
   * Creates the entity in the database
   * @param {Entity} createDto Entity to create
   * @returns {Promise<Entity>} created entity
   * @todo currently returns an object of provided DTO type
   */
  create(createDto: Entity) {
    return this.repository.save(createDto);
  }

  /**
   * Retreives all entities that matches the criteria
   * @param {FindManyOptions<Entity>} options find many options
   * @returns {Promise<Entity[]>} resulting entities
   */
  findAll(options: FindManyOptions<Entity> = {}) {
    return this.repository.find(options);
  }

  /**
   * Retrives the first entity that matches the criteria
   * @param {FindOneOptions<Entity>} options find one options
   * @returns {Promise<Entity | null>} resulting entity
   */
  findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repository.findOne(options);
  }

  /**
   * Retrives an entity by its ID
   * @param {string} id id to retrieve an entity for
   * @param {Omit<FindOneOptions<Entity>, 'where'>} options find one options
   * @returns {Promise<Entity | null>} resulting entity
   */
  findOneById(
    id: string,
    options: Omit<FindOneOptions<Entity>, 'where'> = {},
  ): Promise<Entity | null> {
    return this.repository.findOne({
      where: { id },
      ...options,
    } as unknown as FindOneOptions<Entity>);
  }

  /**
   * Retrieves an entity by its ID. Throws an error if none was found
   * @param {string} id id to retrieve an entity for
   * @returns {Promise<Entity>} resulting entity
   */
  findOneByIdOrFail(id: string) {
    return this.repository.findOneByOrFail({
      id,
    } as unknown as FindOptionsWhere<Entity>);
  }

  /**
   * Updates an entity of ID. Throws an error if none was found
   * @param {string} id id to update an entity for
   * @param {QueryDeepPartialEntity<Entity>} updateDto entity values to update
   * @returns {Promise<Entity} updated entity
   */
  async update(id: string, updateDto: QueryDeepPartialEntity<Entity>) {
    await this.findOneByIdOrFail(id);

    await this.repository.update(id, updateDto);

    return await this.findOneById(id);
  }

  /**
   * Deletes an entity of id
   * @param {string} id id of entity to delete
   * @returns {Promise<DeleteResult>} deletion result
   */
  async remove(id: string): Promise<DeleteResult> {
    await this.findOneByIdOrFail(id);

    return await this.repository.delete(id);
  }

  /**
   * Counts the number of resulting entities of the provided criteria
   * @param {FindManyOptions<Entity>} options find many options
   * @returns {Promise<number>} length of the resulting entities
   */
  count(options: FindManyOptions<Entity> = {}): Promise<number> {
    return this.repository.count(options);
  }
}
