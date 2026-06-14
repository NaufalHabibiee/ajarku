"use client";

import { useFormState } from "react-dom";
import type { ActionState } from "@/lib/actions/superadmin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  subscriptionPrice: number;
  bunnyLibraryId: string | null;
  bunnyApiKey: string | null;
  midtransClientKey: string | null;
  midtransServerKey: string | null;
};

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function TenantForm({
  action,
  tenant,
}: {
  action: Action;
  tenant?: Tenant;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);
  const isEdit = Boolean(tenant);

  return (
    <form action={formAction} className="space-y-5">
      <FormToast state={state} />
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          {state.success}
        </p>
      )}
      {tenant && <input type="hidden" name="id" value={tenant.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Tenant name</Label>
          <Input id="name" name="name" defaultValue={tenant?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Subdomain slug</Label>
          {isEdit ? (
            <Input id="slug" value={tenant?.slug} disabled />
          ) : (
            <Input id="slug" name="slug" placeholder="acme" required />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customDomain">Custom domain (optional)</Label>
          <Input
            id="customDomain"
            name="customDomain"
            defaultValue={tenant?.customDomain ?? ""}
            placeholder="course.client.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscriptionPrice">Monthly price (IDR)</Label>
          <Input
            id="subscriptionPrice"
            name="subscriptionPrice"
            type="number"
            min={0}
            defaultValue={tenant?.subscriptionPrice ?? 99000}
          />
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="adminEmail">Initial admin email (optional)</Label>
          <Input
            id="adminEmail"
            name="adminEmail"
            type="email"
            placeholder="instructor@client.com"
          />
          <p className="text-xs text-muted-foreground">
            This email becomes an admin when they register/log in on the tenant
            site.
          </p>
        </div>
      )}

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Integrations</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bunnyLibraryId">Bunny Library ID</Label>
            <Input
              id="bunnyLibraryId"
              name="bunnyLibraryId"
              defaultValue={tenant?.bunnyLibraryId ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bunnyApiKey">Bunny API Key</Label>
            <Input
              id="bunnyApiKey"
              name="bunnyApiKey"
              type="password"
              defaultValue={tenant?.bunnyApiKey ?? ""}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="midtransClientKey">Midtrans Client Key</Label>
            <Input
              id="midtransClientKey"
              name="midtransClientKey"
              defaultValue={tenant?.midtransClientKey ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="midtransServerKey">Midtrans Server Key</Label>
            <Input
              id="midtransServerKey"
              name="midtransServerKey"
              type="password"
              defaultValue={tenant?.midtransServerKey ?? ""}
              placeholder="••••••••"
            />
          </div>
        </div>
      </fieldset>

      <SubmitButton variant="brand">
        {isEdit ? "Save changes" : "Create tenant"}
      </SubmitButton>
    </form>
  );
}
