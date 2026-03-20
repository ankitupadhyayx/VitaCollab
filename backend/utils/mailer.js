const { Resend } = require("resend");

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "VitaCollab <contact@vitacollab.in>",
    to: [to],
    subject,
    html
  });

  if (error) {
    throw new Error(error.message || "Unable to send email with Resend");
  }

  return { queued: true };
};

module.exports = {
  sendEmail
};
