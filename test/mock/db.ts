import { Connection, getRepository } from 'typeorm';
import * as path from 'path';
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli/dist';

export async function applyFixtures(connection: Connection, name: string) {
  await connection.synchronize(true);

  const loader = new Loader();
  loader.load(path.join(__dirname, '..', 'fixtures', name));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    await getRepository(entity.constructor.name).save(entity);
  }
}
