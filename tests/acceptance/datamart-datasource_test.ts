import { expect } from 'chai';
import { createServer } from '../../lib/server.ts';

describe('Acceptance | default route', function () {
  it('should return the default request result: 33', async function () {
    // when
    const server = await createServer();
    const response = await server.inject({ method: 'GET', url: '/' });

    // then
    expect(response.payload).to.equal('[{"count":33}]');
  });
});
