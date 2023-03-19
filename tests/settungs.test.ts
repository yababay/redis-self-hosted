import { username, password } from "../lib/settings"

test("settings should be correct", () => {
    expect(typeof username).toBe('string')
    expect(typeof password).toBe('string')
})
