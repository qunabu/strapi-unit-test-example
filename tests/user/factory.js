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
  return;
};
/**
 * Creates new user in strapi database
 * @param strapi, instance of strapi
 * @param options that overwrites default options
 * @returns {object} object of new created user, fetched from database
 */
const createUser = async (strapi, data) => {
  /** Gets the default user role */
  const defaultRole = await strapi
    .query("role", "users-permissions")
    .findOne({}, []);
  /** Creates a new user an push to database */
  return await strapi.plugins["users-permissions"].services.user.add({
    ...(data || mockUserData()),
    role: defaultRole ? defaultRole.id : null,
  });
};

module.exports = {
  mockUserData,
  createUser,
  defaultData,
};
