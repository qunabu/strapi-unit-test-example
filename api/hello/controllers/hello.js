'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  index: async (ctx) => {
    ctx.send("Hello World!");
  },
  hi: (ctx) => {
    ctx.send(`Hi ${ctx.state.user.username}`);
  },
};
