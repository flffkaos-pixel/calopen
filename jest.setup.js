// Mock Request/Response for Next.js API routes
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Map(Object.entries(options.headers || {}));
      this.body = options.body;
    }
    async json() {
      return JSON.parse(this.body);
    }
    async text() {
      return this.body || '';
    }
  };
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.headers = new Map(Object.entries(options.headers || {}));
    }
    async json() {
      return JSON.parse(this.body);
    }
  };
}

if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers extends Map {
    constructor(init = {}) {
      super();
      Object.entries(init).forEach(([key, value]) => this.set(key, value));
    }
    get(name) {
      return super.get(name.toLowerCase());
    }
    set(name, value) {
      return super.set(name.toLowerCase(), value);
    }
  };
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id';
process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
process.env.PAYPAL_TEAMS_PLAN_ID = 'test-teams-id';
process.env.PAYPAL_ORGS_PLAN_ID = 'test-orgs-id';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.EMAIL_FROM = 'test@calopen.dev';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
