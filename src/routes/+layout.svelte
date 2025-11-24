<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
  import { preloadData } from '$app/navigation';
 
	let { children } = $props();

 
	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	if (browser) {
		preloadData('/iat')
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<meta name="title" content="Biais & Moi — Test d'Association Implicite" />
	<meta name="description" content="Outil anonyme de détection des biais cognitifs implicites dans la prise en charge des patients. Test scientifique pour les professionnels de santé." />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Biais & Moi — Test d'Association Implicite" />
	<meta property="og:description" content="Outil anonyme de détection des biais cognitifs implicites dans la prise en charge des patients. Test scientifique pour les professionnels de santé." />
	<meta property="og:site_name" content="Biais & Moi" />
	<meta property="og:locale" content="fr_FR" />
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="Biais & Moi — Test d'Association Implicite" />
	<meta property="twitter:description" content="Outil anonyme de détection des biais cognitifs implicites dans la prise en charge des patients. Test scientifique pour les professionnels de santé." />
	
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
	
	<!-- Prefetch RequireJS and CDN dependencies for IAT -->
	<link rel="prefetch" href="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.3/require.min.js" as="script" crossorigin="anonymous" />
	<link rel="prefetch" href="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min.js" as="script" crossorigin="anonymous" />
	<link rel="prefetch" href="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.7.0/lodash.min.js" as="script" crossorigin="anonymous" />
	<link rel="prefetch" href="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js" as="script" crossorigin="anonymous" />
	<link rel="prefetch" href="https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.3/text.min.js" as="script" crossorigin="anonymous" />
	
	<!-- Prefetch bundled IAT script -->
	<link rel="prefetch" href="/iat-bundle.js" as="script" />
</svelte:head>

{@render children()}

<style global>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background-color: #f7f7f7;
		color: #2c2c2c;
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.3;
	}

	:global(p) {
		color: #4a4a4a;
	}
</style>
