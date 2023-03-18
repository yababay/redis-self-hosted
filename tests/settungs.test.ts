import { username, password, redisUrl } from "../lib/settings"

test("settings should be correct", () => {
    expect(typeof username).toBe('string')
    expect(typeof password).toBe('string')
    expect(typeof redisUrl === 'string' && redisUrl.startsWith('https://')).toBeTruthy()
})
