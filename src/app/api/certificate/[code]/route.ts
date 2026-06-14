import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/certificate-pdf";

// Convert a tenant hex color to pdf-lib rgb (0..1) via a simple hex parse.
function hexToRgb01(hex: string | null) {
  if (!hex) return undefined;
  const h = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return undefined;
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: params.code },
    include: {
      user: true,
      course: { include: { tenant: true } },
    },
  });

  if (!certificate) {
    return new Response("Certificate not found", { status: 404 });
  }

  const pdf = await generateCertificatePdf({
    studentName: certificate.user.name ?? certificate.user.email,
    courseName: certificate.course.title,
    tenantName: certificate.course.tenant.name,
    issuedAt: certificate.issuedAt,
    verificationCode: certificate.verificationCode,
    brandColor: hexToRgb01(certificate.course.tenant.primaryColor),
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certificate.verificationCode}.pdf"`,
    },
  });
}
