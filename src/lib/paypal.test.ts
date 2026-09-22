import { paypalScriptOptions, PLANS } from './paypal'

describe('PayPal Configuration', () => {
  describe('paypalScriptOptions', () => {
    it('should have client ID from env', () => {
      expect(paypalScriptOptions.clientId).toBeDefined()
      expect(typeof paypalScriptOptions.clientId).toBe('string')
    })

    it('should use USD currency', () => {
      expect(paypalScriptOptions.currency).toBe('USD')
    })

    it('should use subscription intent', () => {
      expect(paypalScriptOptions.intent).toBe('subscription')
    })

    it('should enable vault', () => {
      expect(paypalScriptOptions.vault).toBe(true)
    })
  })

  describe('PLANS', () => {
    it('should have free plan', () => {
      expect(PLANS.free).toBeDefined()
      expect(PLANS.free.name).toBe('Free')
      expect(PLANS.free.price).toBe(0)
    })

    it('should have free plan features', () => {
      expect(PLANS.free.features).toBeInstanceOf(Array)
      expect(PLANS.free.features.length).toBeGreaterThan(0)
    })

    it('should have teams plan', () => {
      expect(PLANS.teams).toBeDefined()
      expect(PLANS.teams.name).toBe('Teams')
      expect(PLANS.teams.price).toBe(12)
    })

    it('should have teams plan features', () => {
      expect(PLANS.teams.features).toBeInstanceOf(Array)
      expect(PLANS.teams.features.length).toBeGreaterThan(0)
    })

    it('should have organizations plan', () => {
      expect(PLANS.organizations).toBeDefined()
      expect(PLANS.organizations.name).toBe('Organizations')
      expect(PLANS.organizations.price).toBe(28)
    })

    it('should have organizations plan features', () => {
      expect(PLANS.organizations.features).toBeInstanceOf(Array)
      expect(PLANS.organizations.features.length).toBeGreaterThan(0)
    })

    it('should have correct price hierarchy', () => {
      expect(PLANS.free.price).toBeLessThan(PLANS.teams.price)
      expect(PLANS.teams.price).toBeLessThan(PLANS.organizations.price)
    })
  })
})
