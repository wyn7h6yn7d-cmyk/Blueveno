import { BLUEVENO_SUPPORT_EMAIL, supportMailto } from "@/lib/legal/constants";

type LegalContactLinkProps = {
  subject?: string;
  className?: string;
};

export function LegalContactLink({ subject, className }: LegalContactLinkProps) {
  return (
    <a href={supportMailto(subject)} className={className}>
      {BLUEVENO_SUPPORT_EMAIL}
    </a>
  );
}
