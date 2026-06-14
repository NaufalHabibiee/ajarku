import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CertificateActions } from "@/components/certificate-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify certificate" };

export default async function VerifyPage({
  params,
}: {
  params: { code: string };
}) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: params.code },
    include: {
      user: { select: { name: true, email: true } },
      course: { include: { tenant: { select: { name: true } } } },
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        {certificate ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h1 className="text-2xl font-bold">Valid certificate</h1>
            <p className="mt-2 text-muted-foreground">
              This certificate is authentic.
            </p>
            <dl className="mt-6 space-y-3 text-left text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Student</dt>
                <dd className="font-medium">
                  {certificate.user.name ?? certificate.user.email}
                </dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="font-medium">{certificate.course.title}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Issued by</dt>
                <dd className="font-medium">
                  {certificate.course.tenant.name}
                </dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-medium">
                  {certificate.issuedAt.toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Code</dt>
                <dd className="font-mono text-xs">
                  {certificate.verificationCode}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-center">
              <CertificateActions
                code={certificate.verificationCode}
                size="sm"
              />
            </div>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 h-14 w-14 text-destructive" />
            <h1 className="text-2xl font-bold">Certificate not found</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t verify a certificate with the code{" "}
              <span className="font-mono">{params.code}</span>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
