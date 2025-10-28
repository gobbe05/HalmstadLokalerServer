// src/email.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY saknas i miljön.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string; // default nedan
};

export async function sendEmail(opts: SendEmailOptions) {
  const from = opts.from ?? "HalmstadLokaler <noreply@mail.halmstadlokaler.se>"; // sätt till din verifierade avsändare

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      // Resend SDK returnerar ofta error-objekt
      throw error;
    }

    return data; // innehåller t.ex. id för skickat mail
  } catch (err) {
    console.error("sendEmail error:", err);
    throw err;
  }
}
