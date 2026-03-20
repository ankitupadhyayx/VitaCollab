import { Resend } from "resend";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getContactRequestHtml = ({ name, email, message }) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;background:#f8fafc;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;background:#f1f5f9;">
          <h2 style="margin:0;font-size:20px;color:#0f172a;">New Contact Request - VitaCollab</h2>
        </div>
        <div style="padding:20px;">
          <div style="margin-bottom:12px;">
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Name</div>
            <div style="font-size:15px;color:#0f172a;font-weight:600;">${safeName}</div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Email</div>
            <div style="font-size:15px;color:#0f172a;font-weight:600;">${safeEmail}</div>
          </div>
          <div>
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Message</div>
            <div style="font-size:15px;color:#0f172a;">${safeMessage}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const getAutoReplyHtml = ({ name }) => {
  const safeName = escapeHtml(name);

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;background:#f8fafc;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;background:#f1f5f9;">
          <h2 style="margin:0;font-size:20px;color:#0f172a;">We received your request</h2>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 10px;">Hi ${safeName},</p>
          <p style="margin:0 0 10px;">Thank you for contacting VitaCollab. We have received your message and our team will get in touch with you soon.</p>
          <p style="margin:0;">Best regards,<br/>VitaCollab Team</p>
        </div>
      </div>
    </div>
  `;
};

export async function sendContactEmail({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const resend = new Resend(apiKey);
  const adminResult = await resend.emails.send({
    from: "VitaCollab <contact@vitacollab.in>",
    to: ["ankitupadhyayx@gmail.com"],
    replyTo: email,
    subject: `New Contact Message from ${name}`,
    html: getContactRequestHtml({ name, email, message })
  });

  if (adminResult.error) {
    throw new Error(adminResult.error.message || "Unable to send admin email with Resend");
  }

  const userResult = await resend.emails.send({
    from: "VitaCollab <contact@vitacollab.in>",
    to: [email],
    subject: "We received your request",
    html: getAutoReplyHtml({ name })
  });

  if (userResult.error) {
    throw new Error(userResult.error.message || "Unable to send auto-reply email with Resend");
  }
}
