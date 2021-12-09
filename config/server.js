module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '2lE7LS7MOh1ey1Cp/zMIf2ET5ZfBTcKBey+SZe9nhhyh6Jd1KnXR0/rr9AftGmRbML5hoddCAO9+\n' +
        'yb5o64gbbA=='),
    },
  },
});
