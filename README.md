# Biais & Moi — Implicit Association Test

An anonymous tool for measuring implicit cognitive biases in patient handling for doctors, developed as part of a medical thesis.

## About the Project

This project offers an **Implicit Association Test (IAT)** to measure implicit cognitive biases related to racism. These are unconscious prejudices that we may not think we're subject to, but which can influence our behaviors and decisions.

### Academic Context

This test was developed as part of a **medical thesis** and will remain online after the defense to continue raising public awareness about the existence of these cognitive biases.

### Scientific Foundation

The test is based on research by Harvard University researchers who developed the IAT method. This approach measures automatic associations between concepts (e.g., "White people" and "Black people") and evaluations (e.g., "Good", "Bad").

Scientific studies show that the IAT can predict certain discriminatory behaviors in real-world contexts such as hiring, education, healthcare, and law enforcement.

**Primary reference:**

> Nosek, B. A., Smyth, F. L., Hansen, J. J., Devos, T., Lindner, N. M., Ratliff (Ranganath), K. A., Smith, C. T., Olson, K. R., Chugh, D., Greenwald, A. G., & Banaji, M. R. (2007). Pervasiveness and correlates of implicit attitudes and stereotypes. _European Review of Social Psychology_, 18, 36-88.

### Additional Resources

- Official Harvard IAT project site: [https://implicit.harvard.edu/implicit/](https://implicit.harvard.edu/implicit/)
- Frequently asked questions about the IAT: [https://www.projectimplicit.net/resources/about-the-iat/](https://www.projectimplicit.net/resources/about-the-iat/)

---

## Technical Documentation

### Local Development

Start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173`

### Project Architecture

The project is built with **SvelteKit** and follows an isolated page structure for easier maintenance:

```
src/routes/
├── +page.svelte                    # Landing page / homepage
├── identity/                       # Demographic data collection
│   ├── +page.svelte
│   ├── field-values.ts
│   └── identity.storage.ts
├── iat/                            # The IAT test itself
│   ├── +page.svelte
│   ├── +page.ts
│   ├── components/                 # Test-specific components
│   └── config/                     # Categories and instructions configuration
│       ├── categories/
│       └── instructions/
├── results/                        # Results display
│   ├── +page.svelte
│   └── +page.ts
└── api/
    └── submit-results/             # Single API endpoint to submit results
        └── +server.ts
```

### User Flow

1. **Landing page** (`/`) — Introduction to the test and requirements
2. **Identity** (`/identity`) — Collection of anonymous demographic data (gender, age, profession, ethnic origin, etc.)
3. **IAT Test** (`/iat`) — The 7-part test with changing instructions
4. **Results** (`/results`) — Display of results and explanations

### API

The project uses only **one API endpoint**:

- **POST** `/api/submit-results` — Submits test results (score + demographic data) for anonymous storage

### Automated Deployment

The project is configured for **automated deployment on Vercel**:

- ✅ Each push to the `main` branch triggers a production deployment
- ⚠️ **Recommendation**: Use Pull Requests to validate your changes before merging to `main`, unless you know exactly what you're doing

The project is pre-configured with `@sveltejs/adapter-vercel` which automatically handles:

- Serverless functions for API routes
- Performance optimization
- Page routing

### Technologies Used

- 🚀 **SvelteKit** — Full-stack framework
- 📘 **TypeScript** — Static typing
- 🎨 **Svelte 5** with runes — Reactive interface
- ☁️ **Vercel** — Hosting and deployment
