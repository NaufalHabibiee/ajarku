import type { Tenant } from "@prisma/client";
import { hexToHslString, readableForeground } from "@/lib/color";

/**
 * Injects the tenant's brand colors as CSS variables so any `bg-brand` /
 * `text-brand` utility picks them up. Renders nothing visible.
 */
export function TenantBranding({ tenant }: { tenant: Tenant | null }) {
  if (!tenant) return null;

  const brand = hexToHslString(tenant.primaryColor) ?? "243 75% 59%";
  const brandFg = readableForeground(tenant.primaryColor);
  const accent = hexToHslString(tenant.accentColor);

  const css = `:root{--brand:${brand};--brand-foreground:${brandFg};${
    accent ? `--brand-accent:${accent};` : ""
  }}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
