import { notFound } from "next/navigation";
import { getTenant } from "@/lib/tenant";
import { PricingCard } from "@/components/public/pricing-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  return (
    <section className="container py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Full access to {tenant.name} for one monthly price.
        </p>
      </div>
      <PricingCard tenant={tenant} />
    </section>
  );
}
