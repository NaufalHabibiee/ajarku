"use client";

import { signOut } from "@/app/(auth)/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({
  withIcon = false,
  children = "Sign out",
  ...props
}: ButtonProps & { withIcon?: boolean }) {
  return (
    <form action={signOut}>
      <Button type="submit" {...props}>
        {withIcon && <LogOut className="mr-2 h-4 w-4" />}
        {children}
      </Button>
    </form>
  );
}
