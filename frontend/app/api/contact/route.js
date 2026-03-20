import { sendContactEmail } from "@/lib/mailer";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body?.name || "").toString().trim();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const message = (body?.message || "").toString().trim();

    if (name.length < 2) {
      return Response.json({ success: false, message: "Name must be at least 2 characters." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ success: false, message: "Please provide a valid email address." }, { status: 400 });
    }

    if (message.length < 10) {
      return Response.json({ success: false, message: "Message must be at least 10 characters." }, { status: 400 });
    }

    await sendContactEmail({ name, email, message });

    return Response.json(
      {
        success: true,
        message: "Message sent successfully 🚀"
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error?.message || "Unable to send message right now. Please try again later."
      },
      { status: 500 }
    );
  }
}
