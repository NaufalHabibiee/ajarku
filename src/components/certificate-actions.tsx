"use client";

import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Download the certificate PDF and share it to LinkedIn. The LinkedIn share
 * points at the public /verify/[code] page so anyone can validate it.
 */
export function CertificateActions({
  code,
  size = "default",
}: {
  code: string;
  size?: "default" | "sm";
}) {
  function shareToLinkedIn() {
    const url = `${window.location.origin}/verify/${code}`;
    const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(share, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="brand" size={size}>
        <a
          href={`/api/certificate/${code}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="mr-2 h-4 w-4" /> Download
        </a>
      </Button>
      <Button variant="outline" size={size} onClick={shareToLinkedIn}>
        <Share2 className="mr-2 h-4 w-4" /> Share to LinkedIn
      </Button>
    </div>
  );
}
