This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Setup

The application provides separate authentication systems for regular users and admin users.

### Setting up Admin Authentication

To create the first admin user, you can use the admin creation API endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "StrongPassword123", "secretKey": "change-this-in-production"}'
```

Make sure to:
1. Set a strong password
2. Change the `secretKey` in your environment variables (`ADMIN_CREATION_KEY`)
3. Disable the admin creation endpoint in production by removing the `ALLOW_ADMIN_CREATION` environment variable

### Environment Variables

Create a `.env` file with the following variables:

```
# Database
DATABASE_URL=mongodb+srv://username:password@cluster0.example.mongodb.net/wecargo_db?retryWrites=true&w=majority

# User authentication
JWT_SECRET=your-user-jwt-secret-key-change-in-production

# Admin authentication
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-change-in-production
ADMIN_CREATION_KEY=change-this-in-production

# Only set this in development or when you need to create the first admin
ALLOW_ADMIN_CREATION=true
```

## Migrating from Clerk to Custom Authentication

This project has been migrated from Clerk to a custom authentication system. If you're updating from a version that used Clerk, follow these steps:

1. Remove Clerk dependencies:
```bash
npm uninstall @clerk/nextjs @clerk/express @clerk/types
```

2. Update the database schema:
```bash
npx prisma db push
```

3. Create your first admin user:
```bash
curl -X POST http://localhost:3000/api/admin/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "StrongPassword123", "secretKey": "change-this-in-production"}'
```

4. Set up environment variables in `.env`:
```
# Database
DATABASE_URL=mongodb+srv://username:password@cluster0.example.mongodb.net/wecargo_db?retryWrites=true&w=majority

# User authentication
JWT_SECRET=your-user-jwt-secret-key-change-in-production

# Admin authentication
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-change-in-production
ADMIN_CREATION_KEY=change-this-in-production

# Only set this in development or when you need to create the first admin
ALLOW_ADMIN_CREATION=true
```
