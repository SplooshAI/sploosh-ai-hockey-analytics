# Sploosh AI Hockey Analytics

This is a [Next.js](https://nextjs.org) project bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

**No manual environment variable configuration is required.** The NHL EDGE API
is public and requires no authentication. Build variables for version display
are automatically populated by Docker.

If you want to set up optional environment variables:

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

See `.env.example` for documentation of all available environment variables.

### Running the Development Server

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result.

You can start editing the page by modifying `app/page.tsx`. The page
auto-updates as you edit the file.

This project uses
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load [Geist](https://vercel.com/font), a new
font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out
[the Next.js GitHub repository](https://github.com/vercel/next.js) - your
feedback and contributions are welcome!

## Deploy

This app is self-hosted: the production Docker image runs on an Oracle Cloud VM
behind a Cloudflare Tunnel. See
[docs/deployment/oracle-vm.md](../../docs/deployment/oracle-vm.md).

Check out our
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for more details.
