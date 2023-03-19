"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../lib/settings");
test("settings should be correct", () => {
    expect(typeof settings_1.username).toBe('string');
    expect(typeof settings_1.password).toBe('string');
});
