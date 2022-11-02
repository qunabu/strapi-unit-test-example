const path = require("path");

export default ({ env }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: path.join(
        __dirname,
        "../../..",
        env(
          "DATABASE_FILENAME",
          `.tmp/test${Math.round(Math.random() * 10000)}.db`
        )
      ),
    },
    useNullAsDefault: true,
  },
});
