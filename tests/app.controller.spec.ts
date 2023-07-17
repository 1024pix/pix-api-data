import { assert } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeEach(async function () {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  it('should return "Hello World!"', function () {
    const appController = app.get(AppController);
    assert.equal(appController.getHello(), 'Hello World!');
  });
});
