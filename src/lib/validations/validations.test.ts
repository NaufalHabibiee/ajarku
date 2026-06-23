import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, passwordChangeSchema } from "./auth";
import {
  threadSchema,
  liveSessionSchema,
  hexColorSchema,
  subscriptionPriceSchema,
} from "./content";

describe("signUpSchema", () => {
  it("accepts valid input", () => {
    const r = signUpSchema.safeParse({
      name: "Andi",
      email: "andi@test.com",
      password: "password123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const r = signUpSchema.safeParse({
      name: "Andi",
      email: "andi@test.com",
      password: "short",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(
      signInSchema.safeParse({ email: "nope", password: "x" }).success
    ).toBe(false);
  });
});

describe("passwordChangeSchema", () => {
  it("requires matching passwords", () => {
    expect(
      passwordChangeSchema.safeParse({
        password: "password123",
        confirm: "different1",
      }).success
    ).toBe(false);
    expect(
      passwordChangeSchema.safeParse({
        password: "password123",
        confirm: "password123",
      }).success
    ).toBe(true);
  });
});

describe("threadSchema", () => {
  it("requires a non-empty title and body", () => {
    expect(threadSchema.safeParse({ title: "", body: "x" }).success).toBe(false);
    expect(
      threadSchema.safeParse({ title: "Hello", body: "World" }).success
    ).toBe(true);
  });
});

describe("liveSessionSchema", () => {
  it("coerces a date string", () => {
    const r = liveSessionSchema.safeParse({
      title: "QnA",
      scheduledAt: "2026-06-15T19:00",
      meetUrl: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.scheduledAt).toBeInstanceOf(Date);
  });

  it("rejects invalid meet URLs", () => {
    expect(
      liveSessionSchema.safeParse({
        title: "QnA",
        scheduledAt: "2026-06-15T19:00",
        meetUrl: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("hexColorSchema", () => {
  it("validates hex colors", () => {
    expect(hexColorSchema.safeParse("#14B8A6").success).toBe(true);
    expect(hexColorSchema.safeParse("teal").success).toBe(false);
  });
});

describe("subscriptionPriceSchema", () => {
  it("coerces numeric strings and rejects negatives", () => {
    expect(subscriptionPriceSchema.safeParse("99000").success).toBe(true);
    expect(subscriptionPriceSchema.safeParse("-5").success).toBe(false);
  });
});
