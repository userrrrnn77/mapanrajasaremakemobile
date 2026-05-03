import { expect, describe, it } from "bun:test";
import { validasiLogin } from "../validasiLogin";

describe("Validasi Login", () => {
  it("harus error kalau nomor HP mengandung huruf", () => {
    expect(validasiLogin("0812abc123", "password123")).toBe(
      "Nomor HP harus berupa angka saja",
    );
  });

  it("harus error kalau password kurang dari 8", () => {
    expect(validasiLogin("08123456789", "123")).toBe(
      "Password minimal 8 karakter",
    );
  });

  it("harus null kalau input sudah benar", () => {
    expect(validasiLogin("08123456789", "rahasia123")).toBe(null);
  });
});
