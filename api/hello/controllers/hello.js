'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async index(ctx) {
    ctx.send("Hello World!");
  },
  async hi(ctx) {
    ctx.send(`Hi ${ctx.state.user.username}`);
  },
};
