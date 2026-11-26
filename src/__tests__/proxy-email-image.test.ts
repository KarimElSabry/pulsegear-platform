import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from '../proxy'

const call = (path: string, method = 'GET') => proxy(new NextRequest(`http://x${path}`, { method }))

describe('the photo link used inside emails is public (visitors are not logged in)', () => {
  it('GET /api/email-image/<id> is allowed without the admin cookie', () => {
    expect(call('/api/email-image/12').status).toBe(200)
  })
  it('only GET, only a numeric id, nothing else under that path', () => {
    expect(call('/api/email-image/12', 'POST').status).toBe(401)
    expect(call('/api/email-image/abc').status).toBe(401)
    expect(call('/api/email-image/12/extra').status).toBe(401)
    expect(call('/api/email-image').status).toBe(401)
  })
})
