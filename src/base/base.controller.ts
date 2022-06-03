import { NotFoundException } from '@nestjs/common';
import { BaseService, Delegate } from './base.service';

/**
 * Tried abstracting away everything but this is the minimum version where it works
 * Would've loved to just pass a generic service, DTO and let the base service
 * handle all the dependency injection, pipe validation
 *
 * If the execution has no validation errors, it works. But if there are validation errors,
 * It just returns a generic error and seems to not execute the validation pipe
 *
 * Settling with this version for now
 */

export class BaseController<T extends Delegate> {
  constructor(private readonly baseService: BaseService<T>) {}

  create(dto: unknown) {
    return this.baseService.create(dto);
  }

  retrieveAll() {
    return this.baseService.getMany();
  }

  async retrieveById(id: number) {
    const result = await this.baseService.getById(id);
    if (!result) {
      throw new NotFoundException('Resource not found');
    }

    return result;
  }

  async update(id: number, dto: unknown) {
    const target = await this.baseService.getById(id);

    if (!target) {
      throw new NotFoundException('Resource not found');
    }

    return await this.baseService.update(id, dto);
  }

  async delete(id: number) {
    const target = await this.baseService.getById(id);

    if (!target) {
      throw new NotFoundException('Resource not found');
    }

    return this.baseService.delete(id);
  }
}
