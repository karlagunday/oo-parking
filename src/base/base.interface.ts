import { BaseEntity } from './base.entity';

/**
 * @todo add return types
 */
export interface BaseInterface<
  Entity extends BaseEntity,
  CreateDto,
  UpdateDto,
> {
  create(dto: CreateDto);

  findAll();

  findOne(id: string);

  update(id: string, dto: UpdateDto);

  remove(id: string);
}
