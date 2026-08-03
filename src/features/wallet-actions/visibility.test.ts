import assert from "node:assert/strict";
import { test } from "node:test";
import { canShowSystemBonusCard } from "./visibility";

test("hides the SYSTEM bonus card for USER owners", () => {
    assert.equal(canShowSystemBonusCard("USER"), false);
});

test("shows the SYSTEM bonus card for SYSTEM owners", () => {
    assert.equal(canShowSystemBonusCard("SYSTEM"), true);
});

test("hides the SYSTEM bonus card when owner type is missing", () => {
    assert.equal(canShowSystemBonusCard(null), false);
});
