module.exports = ({ env }) => ({
  app: {
    keys: env.array("APP_KEYS", ["testKey1", "testKey2"]),
  },
});
