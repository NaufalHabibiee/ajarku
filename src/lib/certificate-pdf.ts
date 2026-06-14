import {
  PDFDocument,
  StandardFonts,
  rgb,
  type RGB,
} from "pdf-lib";

type CertificateData = {
  studentName: string;
  courseName: string;
  tenantName: string;
  issuedAt: Date;
  verificationCode: string;
  brandColor?: { r: number; g: number; b: number }; // 0..1
};

/** Render a landscape A4 certificate of completion as PDF bytes. */
export async function generateCertificatePdf(
  data: CertificateData
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  // A4 landscape (points).
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  const brand: RGB = data.brandColor
    ? rgb(data.brandColor.r, data.brandColor.g, data.brandColor.b)
    : rgb(0.31, 0.27, 0.9);
  const ink = rgb(0.1, 0.1, 0.12);
  const muted = rgb(0.45, 0.45, 0.5);

  // Outer + inner borders.
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: brand,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: brand,
    borderWidth: 1,
  });

  const center = (
    text: string,
    y: number,
    size: number,
    font = serif,
    color = ink
  ) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  center(data.tenantName.toUpperCase(), height - 90, 14, sans, muted);
  center("Certificate of Completion", height - 150, 34, serifBold, brand);
  center("This is to certify that", height - 200, 14, serif, muted);
  center(data.studentName, height - 250, 30, serifBold, ink);
  center("has successfully completed the course", height - 295, 14, serif, muted);
  center(data.courseName, height - 335, 22, serifBold, ink);

  // Footer: date + verification.
  const dateStr = data.issuedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText(`Issued: ${dateStr}`, {
    x: 80,
    y: 90,
    size: 11,
    font: sans,
    color: muted,
  });
  const codeText = `Verify: ${data.verificationCode}`;
  const codeW = sans.widthOfTextAtSize(codeText, 11);
  page.drawText(codeText, {
    x: width - 80 - codeW,
    y: 90,
    size: 11,
    font: sans,
    color: muted,
  });

  return pdf.save();
}
