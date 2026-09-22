# Contributing to CalOpen

Thank you for your interest in contributing to CalOpen! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [License](#license)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Git**
- **Docker** (recommended for local database)
- **Supabase account** (for auth and database)

### Setup Development Environment

1. **Fork and clone the repository:**

```bash
git clone https://github.com/yourusername/calopen.git
cd calopen
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your development credentials. See [Environment Variables](#environment-variables) below.

4. **Start local database (optional, for Supabase local dev):**

```bash
docker compose up db redis -d
```

5. **Run database migrations:**

```bash
npm run db:push
```

6. **Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Yes | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | Yes | PayPal client secret |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL |
| `GOOGLE_CLIENT_ID` | No | Google Calendar integration |
| `GOOGLE_CLIENT_SECRET` | No | Google Calendar integration |
| `MICROSOFT_CLIENT_ID` | No | Microsoft Outlook integration |
| `MICROSOFT_CLIENT_SECRET` | No | Microsoft Outlook integration |

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Example:

```bash
git checkout -b feat/add-calendar-sync
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Build process, dependencies

Examples:

```
feat(bookings): add email reminders
fix(api): handle timezone conversion correctly
docs(readme): update installation instructions
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` and type guards

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop destructuring

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Use `class-variance-authority` for component variants
- Use `tailwind-merge` for conditional classes

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── book/              # Public booking pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   └── ui/               # Reusable UI components
└── lib/                   # Utilities and configurations
    ├── db/               # Database schema and connection
    ├── supabase/         # Supabase client setup
    └── *.ts              # Service configurations
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Place test files next to the source files
- Use descriptive test names
- Test both success and error cases
- Mock external services (PayPal, Resend, etc.)

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { PayPalCheckout } from '../paypal-checkout';

describe('PayPalCheckout', () => {
  it('renders loading state initially', () => {
    render(<PayPalCheckout planId="test" userId="user-1" />);
    expect(screen.getByText('Loading PayPal...')).toBeInTheDocument();
  });
});
```

## Pull Request Process

### Before Submitting

1. **Update your branch:**

```bash
git fetch origin
git rebase origin/main
```

2. **Run linting:**

```bash
npm run lint
```

3. **Run tests:**

```bash
npm test
```

4. **Build the project:**

```bash
npm run build
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

1. All PRs require at least one review
2. Address feedback promptly
3. Keep PRs focused and small
4. Squash commits before merging

## Issue Guidelines

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Problem description
- Proposed solution
- Alternatives considered
- Use cases

### Good First Issues

Look for issues labeled `good first issue` - these are perfect for newcomers!

## Project Structure

```
calopen/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # REST API endpoints
│   │   ├── auth/              # Login/signup pages
│   │   ├── book/[username]/   # Public booking pages
│   │   └── dashboard/         # User dashboard
│   ├── components/            # React components
│   └── lib/                   # Utilities
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Production build
└── package.json               # Dependencies
```

## Getting Help

- **Discussions:** Use GitHub Discussions for questions
- **Issues:** Use GitHub Issues for bugs and features
- **Discord:** Join our community (if available)

## License

By contributing to CalOpen, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CalOpen! Your help makes this project better for everyone.
