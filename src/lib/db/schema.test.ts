import {
  users,
  organizations,
  organizationMembers,
  eventTypes,
  availability,
  dateOverrides,
  bookings,
  calendars,
  auditLogs,
  planEnum,
  bookingStatusEnum,
  calendarProviderEnum,
} from './schema'

describe('Database Schema', () => {
  describe('Enums', () => {
    it('should define plan enum with correct values', () => {
      const values = planEnum.enumValues
      expect(values).toEqual(['free', 'teams', 'organizations', 'enterprise'])
    })

    it('should define booking status enum with correct values', () => {
      const values = bookingStatusEnum.enumValues
      expect(values).toEqual(['pending', 'confirmed', 'cancelled', 'completed'])
    })

    it('should define calendar provider enum with correct values', () => {
      const values = calendarProviderEnum.enumValues
      expect(values).toEqual(['google', 'outlook', 'caldav'])
    })
  })

  describe('Users Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(users)
      expect(columns).toContain('id')
      expect(columns).toContain('email')
      expect(columns).toContain('name')
      expect(columns).toContain('avatarUrl')
      expect(columns).toContain('timezone')
      expect(columns).toContain('weekStart')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have id column', () => {
      expect(users.id).toBeDefined()
    })

    it('should have email column', () => {
      expect(users.email).toBeDefined()
    })

    it('should have timezone column with default', () => {
      expect(users.timezone).toBeDefined()
    })
  })

  describe('Organizations Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(organizations)
      expect(columns).toContain('id')
      expect(columns).toContain('name')
      expect(columns).toContain('slug')
      expect(columns).toContain('plan')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have plan column with enum', () => {
      expect(organizations.plan).toBeDefined()
    })
  })

  describe('Event Types Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(eventTypes)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('title')
      expect(columns).toContain('slug')
      expect(columns).toContain('duration')
      expect(columns).toContain('price')
      expect(columns).toContain('isActive')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have duration column', () => {
      expect(eventTypes.duration).toBeDefined()
    })

    it('should have price column', () => {
      expect(eventTypes.price).toBeDefined()
    })
  })

  describe('Availability Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(availability)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('dayOfWeek')
      expect(columns).toContain('startTime')
      expect(columns).toContain('endTime')
      expect(columns).toContain('isActive')
    })
  })

  describe('Date Overrides Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(dateOverrides)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('date')
      expect(columns).toContain('startTime')
      expect(columns).toContain('endTime')
      expect(columns).toContain('reason')
    })
  })

  describe('Bookings Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(bookings)
      expect(columns).toContain('id')
      expect(columns).toContain('eventTypeId')
      expect(columns).toContain('userId')
      expect(columns).toContain('bookerEmail')
      expect(columns).toContain('bookerName')
      expect(columns).toContain('startTime')
      expect(columns).toContain('endTime')
      expect(columns).toContain('status')
      expect(columns).toContain('paymentId')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have status column with enum', () => {
      expect(bookings.status).toBeDefined()
    })
  })

  describe('Calendars Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(calendars)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('provider')
      expect(columns).toContain('accessToken')
      expect(columns).toContain('refreshToken')
      expect(columns).toContain('syncToken')
      expect(columns).toContain('expiresAt')
      expect(columns).toContain('createdAt')
    })

    it('should have provider column with enum', () => {
      expect(calendars.provider).toBeDefined()
    })
  })

  describe('Audit Logs Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(auditLogs)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('organizationId')
      expect(columns).toContain('action')
      expect(columns).toContain('entityType')
      expect(columns).toContain('entityId')
      expect(columns).toContain('metadata')
      expect(columns).toContain('ipAddress')
      expect(columns).toContain('createdAt')
    })
  })

  describe('Organization Members Table', () => {
    it('should have correct column names', () => {
      const columns = Object.keys(organizationMembers)
      expect(columns).toContain('id')
      expect(columns).toContain('organizationId')
      expect(columns).toContain('userId')
      expect(columns).toContain('role')
      expect(columns).toContain('createdAt')
    })
  })

  describe('Table Relationships', () => {
    it('should have userId in eventTypes', () => {
      expect(eventTypes.userId).toBeDefined()
    })

    it('should have userId in availability', () => {
      expect(availability.userId).toBeDefined()
    })

    it('should have userId in bookings', () => {
      expect(bookings.userId).toBeDefined()
    })

    it('should have eventTypeId in bookings', () => {
      expect(bookings.eventTypeId).toBeDefined()
    })

    it('should have userId in calendars', () => {
      expect(calendars.userId).toBeDefined()
    })

    it('should have organizationId in organizationMembers', () => {
      expect(organizationMembers.organizationId).toBeDefined()
    })

    it('should have userId in organizationMembers', () => {
      expect(organizationMembers.userId).toBeDefined()
    })
  })
})
