# IAT Integration Setup

## The Challenge: Bridging Legacy and Modern

This project integrates Harvard's IAT (Implicit Association Test) implementation into a modern SvelteKit application. The original IAT script was built using **legacy web technologies** from the early 2010s:

- **Bower** for package management (deprecated in favor of npm)
- **RequireJS** for AMD module loading (predates ES modules)
- **PIPlayer (Project Implicit Player)** — A specialized framework for running psychological experiments

The challenge was to make this decade-old codebase run seamlessly in a modern SvelteKit + Vite environment while keeping the core IAT logic untouched.

## Architecture Overview

```
static/
├── bower_components/        # Vendor libraries (legacy dependencies)
│   └── PIPlayer/           # Project Implicit Player framework
├── iat5.js                 # Harvard's IAT extension (mostly untouched)
├── iat-script.js           # Our wrapper/bridge layer
└── images/                 # IAT stimulus images

src/routes/iat/
├── loader.svelte           # Svelte component that bootstraps everything
├── config/                 # Modern config in TypeScript/Svelte
│   ├── categories/        # Category definitions (good/bad, etc.)
│   └── instructions/      # Localized instruction text
```

## Component Breakdown

### 1. `static/bower_components/` — Vendor Libraries

This directory contains **legacy dependencies** that would normally be installed via Bower. We've committed them directly to the repository because:

- Bower is deprecated and no longer maintained
- These specific versions are required for PIPlayer compatibility
- The libraries use AMD module format (not compatible with modern bundlers)

**Key libraries:**

- **PIPlayer** — The core experiment framework from Project Implicit
- **RequireJS** — AMD module loader
- **Backbone.js, Underscore.js, jQuery** — Legacy dependencies

Think of this as our "vendor" directory for the IAT subsystem.

### 2. `static/iat5.js` — Harvard's IAT Extension

This is the **official IAT implementation** from Project Implicit, based on their [IAT extension documentation](https://app-prod-03.implicit.harvard.edu/implicit/common/all/js/pip/piscripts/ydocs/dist/index.html).

**Key points:**

- Originally authored by Yoav Bar-Anan and modified by Elad Zlotnick
- Implements the 7-block IAT paradigm with D-score calculation
- Defines trial sequences, error handling, and scoring logic
- **Kept as close to original as possible** to maintain scientific validity

**Minimal modifications made:**

- Some French translations for feedback messages
- Minor tweaks for compatibility (if any were needed)

⚠️ **This file should rarely be touched**

### 3. `static/iat-script.js` — Our Wrapper/Bridge

This is **our custom layer** that bridges the gap between the legacy IAT code and our modern Svelte application.

**What it does:**

```javascript
define(["pipAPI", "pipScorer", "underscore"], function (
  APIConstructor,
  Scorer,
  _
) {
  return {
    init: function (config) {
      // 1. Receives config from Svelte (categories, instructions)
      // 2. Loads iat5.js extension
      // 3. Passes config to IAT extension
      // 4. Activates PIPlayer to start the test
    },
  };
});
```

**Key responsibilities:**

- Accept configuration from modern JavaScript/Svelte code
- Transform that config into the format expected by `iat5.js`
- Initialize the PIPlayer framework
- Provide French localization strings
- Configure canvas size and appearance

This is where we can safely make changes without affecting the core IAT logic.

### 4. `src/routes/iat/loader.svelte` — The Svelte Bootstrap

This Svelte component is the **entry point** that orchestrates loading the entire legacy pipeline.

**The loading sequence:**

1. **Configure RequireJS** on `window.require`:

   ```javascript
   window.require = {
     baseUrl: "/bower_components/PIPlayer/src/js",
     paths: {
       pipAPI: "API",
       jquery: "CDN_or_local_fallback",
       // ... other dependencies
     },
   };
   ```

2. **Load RequireJS** from CDN:

   ```javascript
   <script src="requirejs.min.js"></script>
   ```

3. **Initialize IAT** via our wrapper:

   ```javascript
   require(["/iat-script.js"], function (iatScript) {
     iatScript.init(config); // config from Svelte
   });
   ```

4. **Pass configuration** from modern Svelte world:

   ```javascript
   import { bad, good, white, black } from "./config/categories";
   import * as steps from "./config/instructions";

   const config = {
     category1: white,
     category2: black,
     attribute1: good,
     attribute2: bad,
     steps,
   };
   ```

5. **Handle completion callback**:
   ```javascript
   window.onIATDone = onDone; // Callback prop from parent
   ```

**Why this is necessary:**

- RequireJS expects to be configured globally before loading
- PIPlayer was designed for traditional multi-page apps, not SPAs
- We need to inject modern config (TypeScript, ES modules) into legacy code (AMD modules)

## The MinnoJS Foundation

The entire PIPlayer framework is built on [MinnoJS](https://minnojs.github.io/docs/), a JavaScript library designed specifically for creating online psychological experiments.

**Key MinnoJS concepts used:**

- **Tasks** — Define experimental procedures (in our case, the IAT)
- **Trials** — Individual units within a task
- **Stimuli** — What's shown to participants (words, images)
- **Scoring** — D-score algorithm for IAT results

The [MinnoJS documentation](https://minnojs.github.io/docs/) provides deep insights into:

- How trials are sequenced
- How stimuli are randomly presented
- How the D-score is calculated
- How data is logged and exported

## Configuration Flow

Modern configuration flows from Svelte → Legacy code:

```
TypeScript Config (Svelte)
  ↓
loader.svelte (converts to plain objects)
  ↓
iat-script.js (formats for IAT5)
  ↓
iat5.js (executes IAT)
  ↓
PIPlayer (renders and scores)
```

This allows us to:

- ✅ Define categories and stimuli in TypeScript
- ✅ Use modern tooling (Vite, SvelteKit)
- ✅ Maintain scientific validity (untouched core)
- ✅ Localize to French easily

## Why This Convoluted Approach?

You might wonder: "Why not rewrite everything in modern JavaScript?"

**Reasons for preserving the legacy code:**

1. **Time constraints** — This is for a medical thesis with a deadline. Getting a working, validated IAT is more important than a perfect codebase.

2. **It works** — Despite being old, the PIPlayer framework is robust and battle-tested.
