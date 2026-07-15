import {
  marketingDisplayPhone,
  marketingTelUrl,
  marketingWhatsAppUrl,
} from "@/lib/marketing-contact";
import type { MarketingCopy, MarketingLocale } from "@/lib/marketing-locale";

export function MarketingContactPhoneCard({
  locale,
  copy,
  className = "contact-phone-card",
}: {
  locale: MarketingLocale;
  copy: MarketingCopy;
  className?: string;
}) {
  const phone = marketingDisplayPhone();
  const telUrl = marketingTelUrl();
  const whatsappUrl = marketingWhatsAppUrl(locale);

  return (
    <div className={className} data-reveal="right">
      <span className="contact-form-eyebrow">{copy.contactPhoneEyebrow}</span>

      <div className="contact-phone-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>

      <a href={telUrl} className="contact-phone-number" dir="ltr">
        {phone}
      </a>

      <p className="contact-phone-hint">{copy.contactPhoneHint}</p>

      <div className="contact-phone-actions">
        <a href={telUrl} className="btn btn-primary btn-big contact-phone-call">
          {copy.contactPhoneCall}
        </a>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            className="btn btn-ghost btn-big contact-phone-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.whatsappMegaCta}
          </a>
        ) : null}
      </div>
    </div>
  );
}
