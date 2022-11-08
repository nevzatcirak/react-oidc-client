module.exports = {
  serverRuntimeConfig: {
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'architect-auth',
    SIGNING_SECRET: process.env.SIGNING_SECRET || '61b2946b-fd55-4d92-ba6c-6d1fa24ce4d2',
  },

  rewrites() {
    return [
      {
        source: '/self-service/:slug*',
        destination: '/api/proxy/self-service/:slug*',
      },
      {
        source: '/schemas/:slug*',
        destination: '/api/proxy/schemas/:slug*',
      },
      {
        source: '/sessions/:slug*',
        destination: '/api/proxy/sessions/:slug*',
      },
      {
        source: '/.well-known/:slug*',
        destination: '/api/proxy/.well-known/:slug*',
      },
      {
        source: '/oauth2/:slug*',
        destination: '/api/proxy/oauth2/:slug*',
      },
      {
        source: '/userinfo',
        destination: '/api/proxy/userinfo',
      },
    ];
  },
};
