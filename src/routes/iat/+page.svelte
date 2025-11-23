<script lang="ts">
  import { goto } from '$app/navigation';
  import Loader from './loader.svelte';

  async function onDone(results: any) {
    console.log("Results received in +page.svelte:", results);
    goto('/results', { state: results });
  }

</script>

<svelte:head>
	<title>Biais & Moi — Test</title>
</svelte:head>

<Loader  onDone={onDone} />