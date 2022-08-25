module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "1f8f2b455b69d600fa368be96b7e2330"),
    apiToken: { salt: env("API_TOKEN_SALT") },
  },
});
