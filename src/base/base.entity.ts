import {
  BaseEntity as OrmBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends OrmBaseEntity {
  static construct<T extends BaseEntity>(
    this: new () => T,
    params: Partial<T> = {},
  ): T {
    return Object.assign(new this(), params);
  }

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
