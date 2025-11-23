<script lang="ts">
  import { browser } from "$app/environment";
  /**
  * Loads RequireJS and the IAT script
  */
 import { bad, good, white, black } from "./config/categories";
 import * as steps from './config/instructions';
 import { translations } from './config/translations';
 import { onMount } from 'svelte';
 const { onDone }: { onDone: (args?:any) => void } = $props() 
 
 const config = {
    category1: white,
    category2: black,
    attribute1: good,
    attribute2: bad,
    steps,
    translations
  };

  onMount(() => {
    // Configure RequireJS first
    (window as any).require = {
      waitSeconds: 200,
      enforceDefine: true,
      baseUrl: '/bower_components/PIPlayer/src/js',
      paths: {
        text: ['//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.3/text.min', '../../../requirejs-text/text'],
        jquery: ['//cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min'],
        underscore: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.7.0/lodash.min'],
        backbone: ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min']
      }
    };

    // Load RequireJS
    const requireScript = document.createElement('script');
    requireScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.3/require.min.js';
    requireScript.onload = () => {
      // Load the bundled IAT script
      const bundleScript = document.createElement('script');
      bundleScript.src = '/iat-bundle.js';
      bundleScript.onload = () => {
        initIAT();
      };
      document.head.appendChild(bundleScript);
    };
    document.head.appendChild(requireScript);
  });

  function initIAT() {
    const req = (window as any).require;

    if (browser) {
      console.log("je set", onDone);
      (window as any).onIATDone = onDone;
    }
    
    // Access the bundled module directly
    req(['iatScript'], function (iatScript: any) {
      iatScript.init(JSON.parse(JSON.stringify(config)));
    });
  }


</script>

<style lang="scss">
  :global(#canvas) {
    margin:auto;
    margin-top: min(15vh, 150px);

    :global(.stimulus) {
      margin-bottom: 3rem;
    }

    :global(.stimulus[data-handle="targetStim"]) {
      text-align: center;
    }

    :global(img) {
      display: block;
      margin: auto;
    }
  }
</style>