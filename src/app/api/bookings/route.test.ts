// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: class NextResponse {
    constructor(body, options = {}) {
      this.body = body
      this.status = options.status || 200
      this.headers = new Map(Object.entries(options.headers || {}))
    }
    static json(data, options = {}) {
      return new NextResponse(JSON.stringify(data), options)
    }
  },
  NextRequest: class NextRequest {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this._body = options.body
      this.headers = new Map(Object.entries(options.headers || {}))
    }
    async json() {
      return JSON.parse(this._body)
    }
    async text() {
      return this._body || ''
    }
    get nextUrl() {
      return new URL(this.url)
    }
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

// Mock DB
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    transaction: jest.fn().mockImplementation((fn) => fn({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    })),
  },
}))

// Mock email
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  bookingConfirmationEmail: jest.fn().mockReturnValue('<html>confirmation</html>'),
  bookingReminderEmail: jest.fn().mockReturnValue('<html>reminder</html>'),
}))

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

function createRequest(url: string, options: any = {}) {
  return {
    url,
    method: options.method || 'GET',
    _body: options.body,
    headers: new Map(Object.entries(options.headers || {})),
    async json() {
      return JSON.parse(this._body)
    },
    async text() {
      return this._body || ''
    },
    get nextUrl() {
      return new URL(this.url)
    },
  } as any
}

describe('Bookings API', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('POST /api/bookings', () => {
    it('should return 401 when not authenticated', async () => {
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } }),
        },
      })

      const { POST } = require('@/app/api/bookings/route')
      const request = createRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventTypeId: 'event-1',
          bookerEmail: 'booker@example.com',
          bookerName: 'Booker',
          startTime: '2024-01-15T10:00:00Z',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 when missing required fields', async () => {
      const { POST } = require('@/app/api/bookings/route')
      const request = createRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/bookings', () => {
    it('should return 401 when not authenticated', async () => {
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } }),
        },
      })

      const { GET } = require('@/app/api/bookings/route')
      const request = createRequest('http://localhost:3000/api/bookings')

      const response = await GET(request)
      expect(response.status).toBe(401)
    })
  })
})
