module.exports = {
  // GET /hello
  index: async (ctx) => {
    ctx.send("Hello World!");
  },
  hi: (ctx) => {
    ctx.send(`Hi ${ctx.state.user.username}`);
  },
};
