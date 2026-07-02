import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your real password)
  },
});

export const sendShareNotification = async ({ toEmail, fromEmail, fileName, downloadLink, message }) => {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#1a1d27;color:#c8cde0;border-radius:12px;overflow:hidden;">
      <div style="background:#6366f1;padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:1.3rem;">🔒 SecureShare</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#f0f2ff;margin-top:0;">A file was shared with you</h2>
        <p style="color:#9ca3af;"><strong style="color:#c8cde0;">${fromEmail}</strong> shared a file with you on SecureShare.</p>
        <div style="background:#22263a;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:0.9rem;">📎 <strong style="color:#f0f2ff;">${fileName}</strong></p>
          ${message ? `<p style="margin:8px 0 0;font-size:0.85rem;color:#9ca3af;">"${message}"</p>` : ''}
        </div>
        <a href="${downloadLink}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          View &amp; Download File →
        </a>
        <p style="margin-top:24px;font-size:0.75rem;color:#6b7280;">
          You received this because you have an account on SecureShare. Log in to see all files shared with you.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"SecureShare" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${fromEmail} shared a file with you: ${fileName}`,
    html,
  });
};
