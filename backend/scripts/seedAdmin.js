const connectDb = require("../config/db");
const env = require("../utils/env");
const { ensureDefaultAdmin } = require("../utils/seedAdmin");

const run = async () => {
  await connectDb(env.mongodbUri);
  await ensureDefaultAdmin();
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
