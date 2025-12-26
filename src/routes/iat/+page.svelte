<script lang="ts">
  import { goto } from '$app/navigation';
  import Loader from './loader.svelte';

  async function onDone(results: any) {
    goto('/results', { state: results });
  }

</script>

<svelte:head>
	<title>Biais & Moi — Test</title>
</svelte:head>

<Loader  onDone={onDone} />