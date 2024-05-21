import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TestCustomer } from './TestCustomer.entity';
import { TestFacility } from '../TestFacility/TestFacility.entity';
import { TestCustomerController } from './TestCustomer.controller';
import { TestCustomerService } from './TestCustomer.service';
import { TypeORMMySqlTestingModule } from '../test-utils/TypeormTestingModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

describe('TestCustomerController', () => {
  let app: INestApplication;
  let controller: TestCustomerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeORMMySqlTestingModule([TestCustomer, TestFacility]),
        TypeOrmModule.forFeature([TestCustomer, TestFacility]),
      ],
      controllers: [TestCustomerController],
      providers: [TestCustomerService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<TestCustomerController>(TestCustomerController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call CustomerController get method', async () => {
    const response = await request(app.getHttpServer()).get(
      '/TestCustomers?join%5B0%5D=facilities%7C%7Cid%2Cstatus%7C%7Con%5B0%5D%3Dfacilities.status%7C%7C%24eq%7C%7CActive&filter%5B0%5D=id%7C%7C%24eq%7C%7C4',
    );
    const { body: { data } = {} } = response;
    const [customer] = data || [];
    const { id, name, country, status } = customer || {};

    expect(id).toBe(4);
    expect(name).toBe('Emily Brown');
    expect(country).toBe('Australia');
    expect(status).toBe('Archived');
    return expect(response).not.toEqual(null);
  });

  it('should get status of customers with id = 4', async () => {
    const response = await request(app.getHttpServer()).get(
      '/TestCustomers?fields=status&filter[0]=id%7C%7C$eq%7C%7C4',
    );
    const { body: { data } = {} } = response;
    const [customer] = data || [];
    const { id, status } = customer || {};

    expect(id).toBe(4);
    expect(status).toBe('Archived');
    return expect(response).not.toEqual(null);
  });

  it('should get customers with join on facilities and select facility id and status', async () => {
    const response = await request(app.getHttpServer()).get(
      '/TestCustomers?fields=status&join[]=facilities%7C%7Cid,status',
    );
    const { body: { data } = {} } = response;

    expect(data).toHaveLength(5);

    data.forEach((customer: TestCustomer) => {
      const { id, status, facilities } = customer || {};
      expect(id).not.toEqual(null);
      expect(status).not.toEqual(null);
      expect(facilities).toBeInstanceOf(Array);
      expect(facilities.length).toBeGreaterThan(0);

      facilities.forEach((facility: TestFacility) => {
        expect(facility.id).not.toEqual(null);
        expect(facility.status).not.toEqual(null);
      });
    });

    return expect(response).not.toEqual(null);
  });
});
