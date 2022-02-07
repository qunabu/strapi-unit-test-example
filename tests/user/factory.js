/**
 * Default data that factory use
 */
const defaultData = {
  password: "1234Abc",
  provider: "local",
  confirmed: true,
};

/**
 * Returns random username object for user creation
 * @param {object} options that overwrites default options
 * @returns {object} object that is used with `strapi.plugins["users-permissions"].services.user.add`
 */
const mockUserData = (options = {}) => {
  const usernameSuffix = Math.round(Math.random() * 10000).toString();
  return {
    username: `tester${usernameSuffix}`,
    email: `tester${usernameSuffix}@strapi.com`,
    ...defaultData,
    ...options,
  };
};

/**
 * Creates new user in strapi database
 * @param data
 * @returns {object} object of new created user, fetched from database
 */
const createUser = async (data) => {
  /** Gets the default user role */
  const pluginStore = await strapi.store({
    type: "plugin",
    name: "users-permissions",
  });

  const settings = await pluginStore.get({
    key: "advanced",
  });

  const defaultRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: settings.default_role } });

  /** Creates a new user and push to database */
  return strapi
    .plugin("users-permissions")
    .service("user")
    .add({
      ...mockUserData(),
      ...data,
      role: defaultRole ? defaultRole.id : null,
    });
};

module.exports = {
  mockUserData,
  createUser,
  defaultData,
};
