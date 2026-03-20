const evaluateRisk = ({ failedLoginCount = 0, deleteActionCount = 0, rateLimitHits = 0 }) => {
  const score = Math.min(
    100,
    failedLoginCount * 8 + deleteActionCount * 10 + rateLimitHits * 6
  );

  let level = "LOW";
  if (score >= 35) {
    level = "MEDIUM";
  }
  if (score >= 70) {
    level = "HIGH";
  }

  return { score, level };
};

module.exports = {
  evaluateRisk
};
