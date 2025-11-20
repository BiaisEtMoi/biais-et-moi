# SvelteKit Project Setup

## Project Details

- **Type**: SvelteKit (Frontend + Backend)
- **Deployment**: Vercel Free Tier
- **Created**: November 20, 2025
- **Status**: ✅ Ready for development and deployment

## Project Architecture

### Page Isolation Strategy

Each page in this application should be well-isolated for easy maintenance:

1. **Structure**: Each major page/feature should have its own directory under `src/routes/`
2. **Components**: Page-specific components should be kept in a `components/` subdirectory within each route
3. **Utilities**: Page-specific utilities/helpers should be in a `utils/` subdirectory within each route
4. **Shared Resources**: Only truly shared components and utilities should go in `src/lib/`

### Pages Overview

#### Landing Page (`/`)

- **Location**: `src/routes/+page.svelte`
- **Purpose**: First page users see when visiting the site
- **Content**: Introduction to the IAT (Implicit Association Test) based on Harvard research, test requirements, and conditions

#### Identity Page (`/identity`)

- **Location**: `src/routes/identity/+page.svelte`
- **Purpose**: Collect anonymous demographic information from the user
- **Content**: Form with fields for gender, age, profession, job type (if doctor), specialty (if doctor), workplace structure, region, and ethnic origin
