import { createServer } from "../../server.js";
import chai from 'chai';

describe('Request route', () => {
  const expect = chai.expect;

  it('/ (GET) should return Hello coucou', async function () {
    const server = await createServer();
    const response = await server.inject({method: "GET", url: '/'});
    expect(response.payload).to.equal("Hello coucou");
  });
});
