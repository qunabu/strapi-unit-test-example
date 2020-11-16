module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "postgres",
        host: "localhost",
        port: 5432,
        database: "strapi_tester",
        username: "strapi",
        password: "strapi",
      },
      options: {
        debug: false,
        acquireConnectionTimeout: 100000,
        pool: {
          min: 0,
          max: 50,
          createTimeoutMillis: 30000,
          acquireTimeoutMillis: 600000,
          idleTimeoutMillis: 20000,
          reapIntervalMillis: 20000,
          createRetryIntervalMillis: 200,
        },
      },
    },
  },
});
