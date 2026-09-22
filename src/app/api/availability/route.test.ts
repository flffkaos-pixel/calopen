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

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

function createRequest(url: string, options: any = {}) {
  return {
    url,
    method: options.method || 'GET',
    _body: options.body,
    headers: new Map(Object.entries(options.headers || {})),
    async json() {
      return JSON.parse(this._body)
    },
    get nextUrl() {
      return new URL(this.url)
    },
  } as any
}

describe('Availability API', () => {
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

  describe('GET /api/availability', () => {
    it('should return 401 when not authenticated', async () => {
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } }),
        },
      })

      const { GET } = require('@/app/api/availability/route')
      const request = createRequest('http://localhost:3000/api/availability')

      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should return availability schedule when authenticated', async () => {
      const mockSchedule = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      ]
      ;(db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockSchedule),
        }),
      })

      const { GET } = require('@/app/api/availability/route')
      const request = createRequest('http://localhost:3000/api/availability')

      const response = await GET(request)
      expect(response.status).toBe(200)
    })
  })

  describe('PUT /api/availability', () => {
    it('should return 401 when not authenticated', async () => {
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } }),
        },
      })

      const { PUT } = require('@/app/api/availability/route')
      const request = createRequest('http://localhost:3000/api/availability', {
        method: 'PUT',
        body: JSON.stringify({ schedule: [] }),
      })

      const response = await PUT(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 when schedule is missing', async () => {
      const { PUT } = require('@/app/api/availability/route')
      const request = createRequest('http://localhost:3000/api/availability', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })
  })
})
