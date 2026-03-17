const logger = require("./logger");

const sendEmail = async ({ to, subject, html }) => {
  // Placeholder for SMTP or provider integration (SES/SendGrid/Postmark).
  // This keeps auth flows production-structured while remaining environment-agnostic.
  logger.info("Email dispatch requested", {
    to,
    subject,
    previewOnly: true,
    htmlLength: html?.length || 0
  });

  return { queued: true };
};

module.exports = {
  sendEmail
};
