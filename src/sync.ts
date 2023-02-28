import { DataSource } from 'typeorm';
import { join } from 'path';

(async () => {
  console.log('Database config: \n');
  const db: any = {
    type: 'postgres',
    host: 'localhost',
    port: 54322,
    username: 'apso',
    password: 'password',
    database: 'apso',
    schema: 'apso_test',
    synchronize: true,
    logging: 'all',
    entities: [join(__dirname, 'entities', '*.ts')],
  };
  console.log(db);
  const PostgresDataSource = new DataSource(db);
  try {
    await PostgresDataSource.initialize();
    console.log('Data Source has been initialized!');
    await PostgresDataSource.synchronize();
    console.log('Data Source has been synchronized!');
  } catch (err) {
    console.error('Error during Data Source synchronization');
    console.error(err);
  }
})();
