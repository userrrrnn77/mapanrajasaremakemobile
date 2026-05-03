// app/utils/logic/__tests__/geoLogic.test.ts
import { isWithinRadius } from "../geoLogic";
import { describe, it, expect } from "bun:test"; // Import ini biar TS tenang

describe("Geo Logic Test", () => {
  it("harus aman", () => {
    expect(true).toBe(true);
  });
});

describe("Geo Logic Test", () => {
  it("harus mengembalikan true jika user di dalam radius 100m", () => {
    const user = { lat: -6.2, lng: 106.816666 };
    const office = { lat: -6.20005, lng: 106.816666 }; // Jarak sekitar 5 meter
    expect(
      isWithinRadius(user.lat, user.lng, office.lat, office.lng, 100),
    ).toBe(true);
  });

  it("harus mengembalikan false jika user di luar radius 100m", () => {
    const user = { lat: -6.2, lng: 106.816666 };
    const mall = { lat: -6.21, lng: 106.82 }; // Jarak jauh
    expect(isWithinRadius(user.lat, user.lng, mall.lat, mall.lng, 100)).toBe(
      false,
    );
  });
});
