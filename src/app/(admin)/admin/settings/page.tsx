import { requireAdminContext } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrandingForm,
  IntegrationsForm,
} from "@/components/admin/settings-forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { tenant } = await requireAdminContext();

  const data = {
    name: tenant.name,
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    subscriptionPrice: tenant.subscriptionPrice,
    bunnyLibraryId: tenant.bunnyLibraryId,
    bunnyApiKey: tenant.bunnyApiKey,
    midtransClientKey: tenant.midtransClientKey,
    midtransServerKey: tenant.midtransServerKey,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandingForm tenant={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationsForm tenant={data} />
        </CardContent>
      </Card>
    </div>
  );
}
