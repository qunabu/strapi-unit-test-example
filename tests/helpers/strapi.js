const Strapi = require("strapi");
const fs = require("fs");

let instance;

jest.setTimeout(30000);

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Setups strapi for futher testing
 */
async function setupStrapi() {
  if (!instance) {
    /** the follwing code in copied from `./node_modules/strapi/lib/Strapi.js` */
    await Strapi().load();
    instance = strapi; // strapi is global now

    await instance.app
      .use(instance.router.routes()) // populate KOA routes
      .use(instance.router.allowedMethods()); // populate KOA methods
  }
  return instance;
}

/**
 * Closes strapi after testing
 */
async function stopStrapi() {
  if (instance) {
    for (const conn of Object.values(instance.connections)) {
      if ("destroy" in conn) {
        await conn.destroy();
      }
    }

    instance.db.destroy();
    instance.server.destroy();

    const dbSettings = strapi.config.get(
      "database.connections.default.settings"
    );

    if (dbSettings && dbSettings.filename) {
      const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
      if (fs.existsSync(tmpDbFile)) {
        fs.unlinkSync(tmpDbFile);
      }
    }
  }
  return instance;
}

/**
 * Returns valid JWT token for authenticated
 * @param {String | number} idOrEmail, either user id, or email
 */
const jwt = (idOrEmail) =>
  strapi.plugins["users-permissions"].services.jwt.issue({
    [Number.isInteger(idOrEmail) ? "id" : "email"]: idOrEmail,
  });

/**
 * Grants database `permissions` table that role can access an endpoint/controllers
 *
 * @param {int} roleID, 1 Autentihected, 2 Public, etc
 * @param {string} value, in form or dot string eg `"permissions.users-permissions.controllers.auth.changepassword"`
 * @param {boolean} enabled, default true
 * @param {string} policy, default ''
 */
const grantPrivilege = async (
  roleID = 1,
  value,
  enabled = true,
  policy = ""
) => {
  const updateObj = value
    .match(/[a-zA-Z-]+[^.|^[\]']/gm)
    .reduceRight((obj, next) => ({ [next]: obj }), { enabled, policy });

  return strapi.plugins[
    "users-permissions"
  ].services.userspermissions.updateRole(roleID, updateObj);
};

/** Updates database `permissions` that role can access an endpoint
 * @see grantPrivilege
 */

const grantPrivileges = async (roleID = 1, values = []) => {
  await Promise.all(values.map((val) => grantPrivilege(roleID, val)));
};

/**
 * Updates the core of strapi
 * @param {*} pluginName
 * @param {*} key
 * @param {*} newValues
 * @param {*} environment
 */
const updatePluginStore = async (
  pluginName,
  key,
  newValues,
  environment = ""
) => {
  const pluginStore = strapi.store({
    environment: environment,
    type: "plugin",
    name: pluginName,
  });

  const oldValues = await pluginStore.get({ key });
  const newValue = Object.assign({}, oldValues, newValues);

  return pluginStore.set({ key: key, value: newValue });
};

/**
 * Get plugin settings from store
 * @param {*} pluginName
 * @param {*} key
 * @param {*} environment
 */
const getPluginStore = (pluginName, key, environment = "") => {
  const pluginStore = strapi.store({
    environment: environment,
    type: "plugin",
    name: pluginName,
  });

  return pluginStore.get({ key });
};

/**
 * Check if response error contains error with given ID
 * @param {string} errorId ID of given error
 * @param {object} response Response object from strapi controller
 * @example
 *
 * const response =  {"statusCode":400,"error":"Bad Request","message":[{"messages":[{"id":"Auth.form.error.confirmed","message":"Your account email is not confirmed"}]}],"data":[{"messages":[{"id":"Auth.form.error.confirmed","message":"Your account email is not confirmed"}]}]}
 * responseHasError("Auth.form.error.confirmed", response) // true
 */
const responseHasError = (errorId, response) => {
  return !!(response &&
    response.message &&
    Array.isArray(response.message) &&
    response.message.find(
      (entry) =>
        entry.messages &&
        Array.isArray(entry.messages) &&
        entry.messages.find((msg) => msg.id && msg.id === errorId)
    ));

};

module.exports = {
  setupStrapi,
  stopStrapi,
  jwt,
  grantPrivilege,
  grantPrivileges,
  updatePluginStore,
  getPluginStore,
  responseHasError,
  sleep,
};
