const mongoose = require("mongoose");
const env = require("../utils/env");
const { User } = require("../models");

async function run() {
  await mongoose.connect(env.mongodbUri);

  // Backfill top-level hospital verification from existing nested profile flag.
  const verifiedResult = await User.updateMany(
    {
      role: "hospital",
      "hospitalProfile.verifiedByAdmin": true,
      isHospitalVerified: { $ne: true }
    },
    {
      $set: { isHospitalVerified: true }
    }
  );

  const pendingResult = await User.updateMany(
    {
      role: "hospital",
      "hospitalProfile.verifiedByAdmin": { $ne: true },
      isHospitalVerified: { $exists: false }
    },
    {
      $set: { isHospitalVerified: false }
    }
  );

  console.log("Hospital verification migration completed", {
    verifiedMatched: verifiedResult.matchedCount,
    verifiedModified: verifiedResult.modifiedCount,
    pendingMatched: pendingResult.matchedCount,
    pendingModified: pendingResult.modifiedCount
  });

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Hospital verification migration failed", error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // Ignore disconnect failures in error path.
  }
  process.exit(1);
});
