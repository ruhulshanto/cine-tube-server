import { envVars } from "../config/env";
import { sendEmail } from "./email";

const frontendBase = () => process.env.FRONTEND_URL || "http://localhost:3000";

function displayFirstName(firstName: string | null | undefined, username: string) {
  return (firstName && firstName.trim()) || username;
}

/**
 * Optional confirmation emails after successful Stripe webhook handling.
 * If SMTP is not configured, logs once and returns (no throw).
 * Failures are logged; they never fail the webhook.
 */
export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  firstName: string | null;
  username: string;
  plan: string;
  startDate: Date;
  endDate: Date;
}): Promise<void> {
  if (!envVars.EMAIL_SENDER) {
    console.log("[PaymentEmail] Skipping subscription email (EMAIL_SENDER_SMTP_* not set)");
    return;
  }
  try {
    await sendEmail({
      to: params.to,
      subject: `CineTube — ${params.plan} subscription confirmed`,
      templateName: "subscriptionConfirmation",
      templateData: {
        firstName: displayFirstName(params.firstName, params.username),
        plan: params.plan,
        startDate: params.startDate.toLocaleString(),
        endDate: params.endDate.toLocaleString(),
        browseUrl: `${frontendBase()}/movies`,
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    console.error("[PaymentEmail] Subscription confirmation failed:", e);
  }
}

export async function sendMoviePaymentConfirmationEmail(params: {
  to: string;
  firstName: string | null;
  username: string;
  movieTitle: string;
  amount: number;
  currency: string;
  paymentTypeLabel: "Purchase" | "Rental";
  transactionId: string;
}): Promise<void> {
  if (!envVars.EMAIL_SENDER) {
    console.log("[PaymentEmail] Skipping movie payment email (EMAIL_SENDER_SMTP_* not set)");
    return;
  }
  try {
    await sendEmail({
      to: params.to,
      subject: `CineTube — ${params.paymentTypeLabel} confirmed: ${params.movieTitle}`,
      templateName: "moviePaymentConfirmation",
      templateData: {
        firstName: displayFirstName(params.firstName, params.username),
        movieTitle: params.movieTitle,
        amount: params.amount.toFixed(2),
        currency: params.currency,
        paymentTypeLabel: params.paymentTypeLabel,
        transactionId: params.transactionId,
        date: new Date().toLocaleString(),
        watchUrl: `${frontendBase()}/movies`,
        year: new Date().getFullYear(),
      },
    });
  } catch (e) {
    console.error("[PaymentEmail] Movie payment confirmation failed:", e);
  }
}
