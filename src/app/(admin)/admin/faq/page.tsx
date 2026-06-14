import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { requireAdminContext } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateFAQ, deleteFAQ, moveFAQ } from "@/lib/actions/faq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

export default async function AdminFaqPage() {
  const { tenant } = await requireAdminContext();
  const faqs = await prisma.fAQ.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">FAQ</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tambah pertanyaan</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {faqs.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada FAQ.
          </div>
        )}
        {faqs.map((f, i) => (
          <Card key={f.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <form action={moveFAQ}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="dir" value="up" />
                    <Button variant="ghost" size="icon" type="submit" disabled={i === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </form>
                  <form action={moveFAQ}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="dir" value="down" />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      disabled={i === faqs.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </form>
                  <form action={deleteFAQ}>
                    <input type="hidden" name="id" value={f.id} />
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                </div>
              </div>
              <form action={updateFAQ} className="space-y-2">
                <input type="hidden" name="id" value={f.id} />
                <Input name="question" defaultValue={f.question} />
                <Textarea name="answer" defaultValue={f.answer} rows={2} />
                <SubmitButton variant="outline" size="sm">
                  Simpan
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
