import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export function mockRepository(model: EntityClassOrSchema) {
  return {
    provide: getRepositoryToken(model),
    useValue: {
      findOne: () => {
        return undefined;
      },
      save: () => {
        return undefined;
      },
      delete: () => {
        return undefined;
      },
      update: () => {
        return undefined;
      },
    },
  };
}
