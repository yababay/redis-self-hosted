import { proxyPort } from "../lib/settings"

test("proxyPort should be number", () => {
    expect(typeof proxyPort).toBe('number')
})

