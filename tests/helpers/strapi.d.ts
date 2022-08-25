type Strapi = Record<string, any>;
type User = Record<string, any>;
type Role = Record<string, any>;

/** resolves node.js HTTP Server for supertest futher testing */
type waitForServer<T> = () => Promise<T>;
/** Setups Strapi for futher testing */
type setupStrapi = () => Promise<Strapi>;
/** Gracfuly closes Strapi after testing */
type stopStrapi = () => Promise<Strapi>;
/** Returns valid JWT token for authenticated
 * @param {String | number} idOrEmail, either user id, or email */
type jwt = (idOrEmail: string | number) => string;
/** Grants database `permissions` table that role can access an endpoint/controllers
 * @param {int} roleID, 1 Autentihected, 2 Public, etc
 * @param {string} value, in form or dot string eg `"plugin::users-permissions.controllers.auth.emailConfirmation"`
 * @param {boolean} enabled, default true
 * @param {string} policy, default '' */
type grantPrivilege = (
  roleID: number,
  path: string,
  enabled?: boolean,
  policy?: string
) => Promise<Role>;
/** Updates database `permissions` that role can access an endpoint */
type grantPrivileges = (roleID: number, values: string[]) => Promise<Role>;
/** Check if response error contains error with given ID */
type responseHasError = (errorId: string, response: object) => boolean;
