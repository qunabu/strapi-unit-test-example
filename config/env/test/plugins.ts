export default ({ env }) => {
  return {
    email: {
      config: {
        provider: "mocknodemailer",
        providerOptions: {},
        settings: {},
      },
    },
  };
};
