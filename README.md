# SvelteKit + Vercel Project

A full-stack SvelteKit application configured for deployment on Vercel's free tier.

## Features

- 🚀 SvelteKit with TypeScript
- 🔄 Server-side API routes (backend functionality)
- 📦 Vercel adapter pre-configured
- 🎨 Svelte 5 with runes

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Homepage with API demo
│   └── api/
│       └── hello/
│           └── +server.ts     # Example API endpoint
├── app.html                   # HTML template
└── ...
```

## Developing

Start the development server:

```sh
npm run dev

# or start and open in browser
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

## API Routes

This project includes a sample API endpoint at `/api/hello`:

- **GET** `/api/hello` - Returns a JSON response with a message and timestamp
- **POST** `/api/hello` - Accepts JSON data and echoes it back

Test it from the homepage or use:

```sh
curl http://localhost:5173/api/hello
```

## Building

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

   ```sh
   npm i -g vercel
   ```

2. Deploy:
   ```sh
   vercel
   ```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will auto-detect SvelteKit and deploy

### Vercel Configuration

The project is pre-configured with `@sveltejs/adapter-vercel` which handles:

- Serverless functions for API routes
- Edge runtime support
- Automatic optimization

No additional configuration needed for basic deployments.

## Learn More

- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte)
- [Vercel Deployment Docs](https://vercel.com/docs/frameworks/sveltekit)
