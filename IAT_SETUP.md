# IAT (Implicit Association Test) Setup Guide

## Overview

The IAT uses the **MinnoJS/PIPlayer** library (from Project Implicit) which was installed via Bower. Since Bower is ancient and MinnoJS uses RequireJS (AMD modules), we're serving it as standalone HTML pages from the `static/` folder.

## File Structure

```
static/
├── bower_components/     # MinnoJS/PIPlayer library (copied from root bower_components)
│   └── PIPlayer/
│       └── src/
│           ├── js/       # PIPlayer JavaScript
│           └── css/      # PIPlayer styles
├── iat.html             # Main IAT page (loads PIPlayer)
└── iat-script.js        # Your IAT configuration
```

```
src/routes/iat/
├── +page.svelte         # Redirects to /iat.html
└── libs/
    └── iat5.js          # IAT5 extension (optional, for advanced usage)
```

## How It Works

1. User visits `/iat` route
2. SvelteKit redirects them to `/iat.html` (static file)
3. `iat.html` loads PIPlayer via RequireJS
4. `iat-script.js` configures and runs your IAT

## Usage

### 1. Start the dev server

```bash
npm run dev
```

### 2. Navigate to the IAT

Visit: http://localhost:5173/iat

### 3. Customize the IAT

Edit `/static/iat-script.js` to customize:

- **Stimuli**: Change the words/images shown
- **Categories**: Black/White people, Good/Bad words, etc.
- **Settings**: Canvas size, colors, timing, etc.

### Example: Using the IAT5 Extension

For a full-featured IAT with automatic scoring, you can use the `iat5.js` extension:

```javascript
// In /static/iat-script.js
define(["pipAPI", "pipScorer"], function (APIConstructor, Scorer) {
  // Load the IAT5 extension
  var iat5Path = "/src/routes/iat/libs/iat5";

  require([iat5Path], function (iatExtension) {
    return iatExtension({
      category1: {
        name: "Black people",
        title: {
          media: { word: "Black people" },
          css: { color: "#336600", "font-size": "1.8em" },
          height: 4,
        },
        stimulusMedia: [
          { word: "Tyrone" },
          { word: "Malik" },
          // ... more names
        ],
        stimulusCss: { color: "#336600", "font-size": "2.3em" },
      },
      category2: {
        name: "White people",
        // ... similar structure
      },
      attribute1: {
        name: "Bad words",
        // ... similar structure
      },
      attribute2: {
        name: "Good words",
        // ... similar structure
      },
      isTouch: false,
      nBlocks: 7,
    });
  });
});
```

## Collecting Results

To save IAT results, you'll need to:

1. Configure the logger in your IAT script:

```javascript
API.addSettings("logger", {
  pulse: 20,
  url: "/api/iat-results", // Your SvelteKit API endpoint
});
```

2. Create a SvelteKit API endpoint at `/src/routes/api/iat-results/+server.ts`:

```typescript
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();

  // Save to database
  console.log("IAT Results:", data);

  return new Response(JSON.stringify({ success: true }));
};
```

## Resources

- [PIPlayer Documentation](http://projectimplicit.github.io/PIPlayer/)
- [MinnoJS GitHub](https://github.com/minnojs/minno-time)
- [Project Implicit](https://implicit.harvard.edu/)

## Troubleshooting

### IAT doesn't load

- Check browser console for errors
- Verify bower_components copied correctly: `ls static/bower_components/PIPlayer`
- Check RequireJS is loading: Look for `config.js` in Network tab

### Stimuli not showing

- Check the stimulus definitions in `iat-script.js`
- Verify CSS paths in `iat.html`

### Want to customize further?

Check `/src/routes/iat/libs/iat5.js` for a complete example of an IAT configuration with all the blocks, scoring, and feedback.
