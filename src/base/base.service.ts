import { Prisma } from '@prisma/client';

type Dict = { [k: string]: any };

type DictWithId = {
  id?: number;
  [k: string]: any;
};

type SelectWithId = {
  id?: boolean;
  [k: string]: any;
};

export type Delegate = {
  findMany: (arg: {
    select?: SelectWithId | null;
    include?: Dict | null;
    where?: Dict;
    orderBy?: Prisma.Enumerable<any>;
    cursor?: Dict;
    take?: number;
    skip?: number;
    distinct?: Prisma.Enumerable<any>;
  }) => any;

  findFirst: (arg: {
    select?: SelectWithId | null;
    rejectOnNotFound?: Prisma.RejectOnNotFound;
    include?: Dict | null;
    where?: DictWithId;
    orderBy?: Prisma.Enumerable<any>;
    cursor?: Dict;
    take?: number;
    skip?: number;
    distinct?: Prisma.Enumerable<any>;
  }) => any;

  create: (arg: {
    select?: SelectWithId | null;
    include?: Dict | null;
    data: any;
  }) => any;

  update: (arg: {
    select?: SelectWithId | null;
    include?: Dict | null;
    data: any;
    where: DictWithId;
  }) => any;

  delete: (arg: {
    select?: SelectWithId | null;
    include?: Dict | null;
    where: DictWithId;
  }) => any;

  [k: string]: any;
};

type FindManyWhereArg<T extends Delegate> = Parameters<
  T['findMany']
>[0]['where'];
type FindFirstWhereArg<T extends Delegate> = Parameters<
  T['findFirst']
>[0]['where'];
type CreateDataArg<T extends Delegate> = Parameters<T['create']>[0]['data'];
type UpdateDataArg<T extends Delegate> = Parameters<T['update']>[0]['data'];

export abstract class BaseService<T extends Delegate> {
  constructor(protected delegate: T) {}

  public getDelegate(): T {
    return this.delegate;
  }

  getMany(where: FindManyWhereArg<T> = {}): ReturnType<T['getMany']> {
    return this.delegate.findMany({ where });
  }

  getById(id: number): ReturnType<T['getOne']> {
    return this.delegate.findFirst({ where: { id } });
  }

  getOne(where: FindFirstWhereArg<T>): ReturnType<T['getOne']> {
    return this.delegate.findFirst({ where });
  }

  create(data: CreateDataArg<T>): ReturnType<T['create']> {
    return this.delegate.create({ data });
  }

  update(id: number, data: UpdateDataArg<T>): ReturnType<T['update']> {
    return this.delegate.update({ data, where: { id } });
  }

  delete(id: number): ReturnType<T['delete']> {
    return this.delegate.delete({ where: { id } });
  }
}
