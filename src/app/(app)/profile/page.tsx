import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm, PasswordForm } from "@/components/profile/profile-forms";
import {
  AchievementsWidget,
  AchievementsWidgetSkeleton,
} from "@/components/dashboard/achievements-widget";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Suspense fallback={<AchievementsWidgetSkeleton />}>
        <AchievementsWidget />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.name ?? ""}
            avatarUrl={user.avatarUrl ?? ""}
            email={user.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
