# Strapi application

Example of `jest` unit tests with Strapi.

See main [test file](tests/app.test.js) for details.

## Tests status CI/CD:

[![qunabu](https://circleci.com/gh/qunabu/strapi-unit-test-example.svg?style=shield)](https://circleci.com/gh/qunabu/strapi-unit-test-example) (click the badge to see the results)

## Postgres test

`docker-compose up -d` to lanuch `Postgres` database for test.

Note that `config/database.js` and `config/env/test/database.js` are using the same connection but different `database`

After all tests testing database is cleared with [knex-cleaner](https://github.com/steven-ferguson/knex-cleaner)

## Running tests

`npm run test` or `yarn test`
