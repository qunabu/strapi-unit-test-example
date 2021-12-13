/**
 * Default data that factory use
 */
const defaultData = {
  title: "test",
  completed: false,
};

/**
 * Returns random username object for user creation
 * @param {object} options that overwrites default options
 * @returns {object} object that is used with `strapi.plugins["users-permissions"].services.user.add`
 */
const mockTodoData = (options = {}) => {
  const todoSuffix = Math.round(Math.random() * 10000).toString();
  return {
    title: `todo#${todoSuffix}`,
    completed: Math.random() < 0.5,
    ...defaultData,
    ...options,
  };
};

/**
 * Creates new user in strapi database
 * @param data
 * @returns {object} object of new created user, fetched from database
 */
const createTodo = async (data) => {
  /** Creates a new task and push it to database */
  return await strapi.services['todo-list'].create({
    ...(data || mockTodoData()),
  });
};

module.exports = {
  mockTodoData,
  createTodo,
  defaultData,
};
