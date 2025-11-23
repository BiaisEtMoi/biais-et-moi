<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
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
	<link rel="icon" href={favicon} />
	
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
