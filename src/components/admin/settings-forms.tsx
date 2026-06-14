"use client";

import { useFormState } from "react-dom";
import {
  updateBranding,
  updateIntegrations,
  type ActionState,
} from "@/lib/actions/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

function Notice({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
        {state.success}
      </p>
    );
  return null;
}

type Tenant = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  subscriptionPrice: number;
  bunnyLibraryId: string | null;
  bunnyApiKey: string | null;
  midtransClientKey: string | null;
  midtransServerKey: string | null;
};

export function BrandingForm({ tenant }: { tenant: Tenant }) {
  const [state, action] = useFormState(updateBranding, initial);
  return (
    <form action={action} className="space-y-4">
      <Notice state={state} />
      <FormToast state={state} />
      <div className="space-y-2">
        <Label htmlFor="name">Course / brand name</Label>
        <Input id="name" name="name" defaultValue={tenant.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={tenant.logoUrl ?? ""}
          placeholder="https://…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue={tenant.primaryColor}
              onChange={(e) => {
                const input = document.getElementById(
                  "primaryColor"
                ) as HTMLInputElement | null;
                if (input) input.value = e.target.value;
              }}
              className="h-10 w-12 rounded border"
            />
            <Input
              id="primaryColor"
              name="primaryColor"
              defaultValue={tenant.primaryColor}
              placeholder="#4f46e5"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accentColor">Accent color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue={tenant.accentColor}
              onChange={(e) => {
                const input = document.getElementById(
                  "accentColor"
                ) as HTMLInputElement | null;
                if (input) input.value = e.target.value;
              }}
              className="h-10 w-12 rounded border"
            />
            <Input
              id="accentColor"
              name="accentColor"
              defaultValue={tenant.accentColor}
              placeholder="#22d3ee"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subscriptionPrice">Monthly price (IDR)</Label>
        <Input
          id="subscriptionPrice"
          name="subscriptionPrice"
          type="number"
          min={0}
          defaultValue={tenant.subscriptionPrice}
        />
      </div>
      <SubmitButton variant="brand">Save branding</SubmitButton>
    </form>
  );
}

export function IntegrationsForm({ tenant }: { tenant: Tenant }) {
  const [state, action] = useFormState(updateIntegrations, initial);
  return (
    <form action={action} className="space-y-4">
      <Notice state={state} />
      <FormToast state={state} />
      <p className="text-sm text-muted-foreground">
        Leave blank to use the platform default keys.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bunnyLibraryId">Bunny Library ID</Label>
          <Input
            id="bunnyLibraryId"
            name="bunnyLibraryId"
            defaultValue={tenant.bunnyLibraryId ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bunnyApiKey">Bunny API Key</Label>
          <Input
            id="bunnyApiKey"
            name="bunnyApiKey"
            type="password"
            defaultValue={tenant.bunnyApiKey ?? ""}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="midtransClientKey">Midtrans Client Key</Label>
          <Input
            id="midtransClientKey"
            name="midtransClientKey"
            defaultValue={tenant.midtransClientKey ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="midtransServerKey">Midtrans Server Key</Label>
          <Input
            id="midtransServerKey"
            name="midtransServerKey"
            type="password"
            defaultValue={tenant.midtransServerKey ?? ""}
            placeholder="••••••••"
          />
        </div>
      </div>
      <SubmitButton variant="brand">Save keys</SubmitButton>
    </form>
  );
}
