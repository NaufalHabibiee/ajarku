import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { parseHost } from "./tenant-host";

describe("parseHost", () => {
  const original = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "ajarku.com";
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = original;
  });

  it("extracts a subdomain slug", () => {
    expect(parseHost("acme.ajarku.com")).toMatchObject({
      slug: "acme",
      isCustomDomain: false,
    });
  });

  it("treats the bare root domain as no tenant", () => {
    expect(parseHost("ajarku.com")).toMatchObject({
      slug: null,
      isCustomDomain: false,
    });
    expect(parseHost("www.ajarku.com")).toMatchObject({
      slug: null,
      isCustomDomain: false,
    });
  });

  it("treats an unrelated host as a custom domain", () => {
    expect(parseHost("course.client.com")).toMatchObject({
      slug: null,
      isCustomDomain: true,
      host: "course.client.com",
    });
  });

  it("strips the port", () => {
    expect(parseHost("acme.ajarku.com:3000").slug).toBe("acme");
  });

  it("handles empty/null host", () => {
    expect(parseHost(null)).toMatchObject({ slug: null, isCustomDomain: false });
    expect(parseHost("")).toMatchObject({ slug: null, isCustomDomain: false });
  });

  it("only takes the first label of a multi-level subdomain", () => {
    expect(parseHost("a.b.ajarku.com").slug).toBe("a");
  });
});
