import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

@Injectable()
export class DatamartRepository {
  constructor(
    @InjectConnection('datamartConnection') private readonly knex: Knex,
  ) {}

  async findAll(): Promise<any> {
    const result = await this.knex.table('data_ref_academies');
    return { result };
  }
}
