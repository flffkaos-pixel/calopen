import { sendEmail, bookingConfirmationEmail, bookingReminderEmail } from './email'

describe('Email Service', () => {
  const mockEmailData = {
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test content</p>',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await sendEmail(mockEmailData)
      expect(result.success).toBe(true)
    })

    it('should return error when send fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Re-import to get fresh mock
      jest.resetModules()
      jest.mock('resend', () => ({
        Resend: jest.fn().mockImplementation(() => ({
          emails: {
            send: jest.fn().mockRejectedValue(new Error('Send failed')),
          },
        })),
      }))

      const { sendEmail: failingSendEmail } = await import('./email')
      const result = await failingSendEmail(mockEmailData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      consoleSpy.mockRestore()
    })
  })

  describe('bookingConfirmationEmail', () => {
    it('should generate HTML with booking details', () => {
      const html = bookingConfirmationEmail({
        bookerName: 'John Doe',
        eventTitle: 'Consultation',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        organizerName: 'Dr. Smith',
      })

      expect(html).toContain('John Doe')
      expect(html).toContain('Consultation')
      expect(html).toContain('Dr. Smith')
      expect(html).toContain('Booking Confirmed')
    })

    it('should include meeting link when provided', () => {
      const html = bookingConfirmationEmail({
        bookerName: 'John Doe',
        eventTitle: 'Consultation',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        organizerName: 'Dr. Smith',
        meetingLink: 'https://meet.example.com/abc123',
      })

      expect(html).toContain('https://meet.example.com/abc123')
    })

    it('should not include meeting link when not provided', () => {
      const html = bookingConfirmationEmail({
        bookerName: 'John Doe',
        eventTitle: 'Consultation',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        organizerName: 'Dr. Smith',
      })

      expect(html).not.toContain('Meeting Link')
    })
  })

  describe('bookingReminderEmail', () => {
    it('should generate HTML with reminder details', () => {
      const html = bookingReminderEmail({
        bookerName: 'John Doe',
        eventTitle: 'Consultation',
        startTime: '2024-01-15T10:00:00Z',
        organizerName: 'Dr. Smith',
      })

      expect(html).toContain('John Doe')
      expect(html).toContain('Consultation')
      expect(html).toContain('Dr. Smith')
      expect(html).toContain('Upcoming Appointment')
    })
  })
})
