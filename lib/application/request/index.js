
const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/',
      config: {
        handler: () => "Hello coucou",
      },
    },
  ]);
};

const name = 'request-api';
export { register, name };
