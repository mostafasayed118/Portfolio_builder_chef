import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Brevo email notification ────────────────────────────────────────────────

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const SENDER = {
  name: "al3tar",
  email: "al3tar66@gmail.com",
} as const;

const REQUEST_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  consulting: { en: "Bakery Consulting", ar: "استشارات مخبوزات" },
  catering: { en: "Catering", ar: "تموين حفلات" },
  training: { en: "Training & Workshops", ar: "تدريب وورش عمل" },
  partnerships: { en: "Partnership", ar: "شراكات" },
  other: { en: "Other", ar: "أخرى" },
};

const ADMIN_INBOX_PATH = "/admin/inbox";

function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildNotificationHtml(params: {
  name: string;
  email: string;
  phone: string | undefined;
  requestType: string;
  message: string;
  adminLink: string;
  isAr: boolean;
}): string {
  const { name, email, phone, requestType, message, adminLink, isAr } = params;
  const rtLabel = REQUEST_TYPE_LABELS[requestType] ?? { en: requestType, ar: requestType };

  const label = (en: string, ar: string) => (isAr ? ar : en);

  return `<!DOCTYPE html>
<html dir="${isAr ? "rtl" : "ltr"}" lang="${isAr ? "ar" : "en"}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f8f8f8;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#1a1a1a;border-radius:12px 12px 0 0;padding:20px 24px;">
      <h1 style="color:#d4a574;margin:0;font-size:18px;">
        ${label("New Inquiry Received", "تم استلام استفسار جديد")}
      </h1>
    </div>
    <div style="background:#ffffff;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;width:140px;${isAr ? "text-align:right;" : ""}">${label("Name", "الاسم")}</td>
          <td style="padding:8px 12px;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;${isAr ? "text-align:right;" : ""}">${label("Email", "البريد الإلكتروني")}</td>
          <td style="padding:8px 12px;"><a href="mailto:${escapeHtml(email)}" style="color:#d4a574;">${escapeHtml(email)}</a></td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;${isAr ? "text-align:right;" : ""}">${label("Phone", "الهاتف")}</td>
          <td style="padding:8px 12px;"><a href="tel:${escapeHtml(phone)}" style="color:#d4a574;">${escapeHtml(phone)}</a></td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;${isAr ? "text-align:right;" : ""}">${label("Request Type", "نوع الطلب")}</td>
          <td style="padding:8px 12px;">${isAr ? rtLabel.ar : rtLabel.en}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;vertical-align:top;${isAr ? "text-align:right;" : ""}">${label("Message", "الرسالة")}</td>
          <td style="padding:8px 12px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(message)}</td>
        </tr>
      </table>
      <div style="margin-top:24px;text-align:center;">
        <a href="${adminLink}" style="display:inline-block;background:#d4a574;color:#1a1a1a;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:14px;">
          ${label("View in Admin Inbox", "عرض في صندوق الوارد")}
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#999;font-size:11px;margin-top:16px;">
      ${label("Chef Mohamed Portfolio — Inquiry Notification", "الشيف محمد — إشعار استفسار")}
    </p>
  </div>
</body>
</html>`;
}

function buildAutoReplyHtml(params: {
  name: string;
  whatsappUrl: string | null;
  isAr: boolean;
}): string {
  const { name, whatsappUrl, isAr } = params;
  const label = (en: string, ar: string) => (isAr ? ar : en);

  const whatsappSection = whatsappUrl
    ? `<p style="font-size:14px;color:#555;line-height:1.6;">
        ${label(
          "For urgent matters, you can also reach us via WhatsApp:",
          "للأمور العاجلة، يمكنك أيضًا التواصل معنا عبر واتساب:",
        )}
      </p>
      <div style="text-align:center;margin:16px 0;">
        <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;">
          WhatsApp
        </a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html dir="${isAr ? "rtl" : "ltr"}" lang="${isAr ? "ar" : "en"}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f8f8f8;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#1a1a1a;border-radius:12px 12px 0 0;padding:20px 24px;">
      <h1 style="color:#d4a574;margin:0;font-size:18px;">
        ${label("Thank you for reaching out!", "شكرًا لتواصلك معنا!")}
      </h1>
    </div>
    <div style="background:#ffffff;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <p style="font-size:14px;color:#333;line-height:1.6;">
        ${label(`Dear ${escapeHtml(name)},`, `${escapeHtml(name)} العزيز/ة،`)}
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        ${label(
          "We have received your inquiry and appreciate your interest. Chef Mohamed personally reviews every inquiry and will get back to you within <strong>24 hours</strong>.",
          "لقد تلقينا استفسارك ونقدر اهتمامك. الشيف محمد يراجع كل استفسار شخصيًا وسيرد عليك خلال <strong>٢٤ ساعة</strong>.",
        )}
      </p>
      ${whatsappSection}
      <p style="font-size:14px;color:#555;line-height:1.6;">
        ${label(
          "Warm regards,<br>Chef Mohamed",
          "مع أطيب التحيات،<br>الشيف محمد",
        )}
      </p>
    </div>
    <p style="text-align:center;color:#999;font-size:11px;margin-top:16px;">
      ${label("This is an automated confirmation. No reply needed.", "هذا تأكيد آلي. لا حاجة للرد.")}
    </p>
  </div>
</body>
</html>`;
}

async function sendBrevoEmail(params: {
  apiKey: string;
  to: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": params.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { success: false, error: `Brevo ${response.status}: ${body}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

export const sendInquiryNotification = internalAction({
  args: {
    inquiryId: v.id("contactInquiries"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("[Email] BREVO_API_KEY not configured — skipping notification");
      await ctx.runMutation(internal.mutations.logEmailActivity, {
        action: "email_skipped",
        inquiryId: args.inquiryId,
        details: "BREVO_API_KEY not set",
      });
      return;
    }

    // Fetch inquiry
    const inquiry = await ctx.runQuery(internal.queries.getInquiryById, {
      id: args.inquiryId,
    });
    if (!inquiry) {
      await ctx.runMutation(internal.mutations.logEmailActivity, {
        action: "email_skipped",
        inquiryId: args.inquiryId,
        details: "Inquiry not found",
      });
      return;
    }

    // Fetch chef email from siteSettings
    const settings = await ctx.runQuery(internal.queries.getSiteSettingsForEmail);
    const chefEmail = settings?.contactInfo?.email;

    if (!chefEmail || chefEmail.trim() === "") {
      console.warn("[Email] Chef email not configured — skipping notification");
      await ctx.runMutation(internal.mutations.logEmailActivity, {
        action: "email_skipped",
        inquiryId: args.inquiryId,
        details: "Chef email not configured in siteSettings",
      });
      return;
    }

    // Detect locale
    const isAr = containsArabic(inquiry.name) || containsArabic(inquiry.message);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";
    const adminLink = `${siteUrl}${ADMIN_INBOX_PATH}`;
    const rtLabel = REQUEST_TYPE_LABELS[inquiry.requestType] ?? { en: inquiry.requestType, ar: inquiry.requestType };

    // ─── 1. Notification to Chef ───────────────────────────────────────────
    const subject = isAr
      ? `استفسار جديد: ${rtLabel.ar} من ${inquiry.name}`
      : `New Inquiry: ${rtLabel.en} from ${inquiry.name}`;

    const notificationHtml = buildNotificationHtml({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      requestType: inquiry.requestType,
      message: inquiry.message,
      adminLink,
      isAr,
    });

    const notifyResult = await sendBrevoEmail({
      apiKey,
      to: chefEmail,
      subject,
      htmlContent: notificationHtml,
    });

    await ctx.runMutation(internal.mutations.logEmailActivity, {
      action: notifyResult.success ? "email_sent" : "email_failed",
      inquiryId: args.inquiryId,
      details: notifyResult.success
        ? `Notification sent to ${chefEmail}`
        : `Notification failed: ${notifyResult.error}`,
    });

    // ─── 2. Auto-reply to inquirer ─────────────────────────────────────────
    const inquirerEmail = inquiry.email?.trim();
    if (inquirerEmail && inquirerEmail.includes("@")) {
      const whatsappUrl = settings?.contactInfo?.whatsapp ?? null;

      const autoReplySubject = isAr
        ? "تم استلام استفسارك — الشيف محمد"
        : "We received your inquiry — Chef Mohamed";

      const autoReplyHtml = buildAutoReplyHtml({
        name: inquiry.name,
        whatsappUrl,
        isAr,
      });

      const replyResult = await sendBrevoEmail({
        apiKey,
        to: inquirerEmail,
        subject: autoReplySubject,
        htmlContent: autoReplyHtml,
      });

      await ctx.runMutation(internal.mutations.logEmailActivity, {
        action: replyResult.success ? "auto_reply_sent" : "auto_reply_failed",
        inquiryId: args.inquiryId,
        details: replyResult.success
          ? `Auto-reply sent to ${inquirerEmail}`
          : `Auto-reply failed: ${replyResult.error}`,
      });
    }
  },
});
