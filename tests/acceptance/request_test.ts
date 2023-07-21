import { expect } from 'chai';
import { createServer } from '../../lib/server.ts';

describe('Acceptance | request', function () {
  it('should return "command valide !" with status code 200', async function () {
    // given
    const payload = {
      requestId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      params: <any>[],
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/request',
      payload,
    });

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.payload).to.equal('command valide !');
  });

  it('should return "command valide !', async function () {
    // given
    const payload = {
      requestId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9b380a11',
      params: <any>[],
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/request',
      payload,
    });

    // then
    expect(response.statusCode).to.equal(400);
    expect(response.payload).to.equal('"requestId" is not a valid UUID');
  });
});
