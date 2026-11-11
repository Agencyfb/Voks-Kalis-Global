import { Resend } from "resend";

let resendClient;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const error = new Error("RESEND_API_KEY must be configured.");
    error.code = "RESEND_CONFIG_MISSING";
    throw error;
  }

  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendPasswordResetEmail({ to, firstName, code }) {
  const from = process.env.RESEND_FROM;
  if (!from) {
    const error = new Error("RESEND_FROM must be configured.");
    error.code = "RESEND_CONFIG_MISSING";
    throw error;
  }

  const { data, error } = await getResendClient().emails.send({
    from,
    to,
    subject: "Your Voks-Kalis Global password reset code",
    text: `Hello ${firstName},\n\nYour password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Hello,</p><p>Your Voks-Kalis Global password reset code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });

  if (error) {
    const sendError = new Error(error.message);
    sendError.code = "RESEND_DELIVERY_FAILED";
    throw sendError;
  }

  if (!data?.id) {
    const sendError = new Error("Resend did not confirm delivery acceptance.");
    sendError.code = "RESEND_DELIVERY_FAILED";
    throw sendError;
  }

  return data;
}
