<script lang="ts">
  import { browser } from "$app/environment";
  /**
  * Loads RequireJS and the IAT script
  */
 import { bad, good, white, black } from "./config/categories";
 import * as steps from './config/instructions';
 import { onMount } from 'svelte';
 const { onDone }: { onDone: (args?:any) => void } = $props() 
 
 const config = {
    category1: white,
    category2: black,
    attribute1: good,
    attribute2: bad,
    steps
  };

  onMount(() => {
    // Check if RequireJS is loaded, if not load it
    if (!(window as any).require) {
      // Configure RequireJS
      (window as any).require = {
        waitSeconds: 200,
        enforceDefine: true,
        baseUrl: '/bower_components/PIPlayer/src/js',
        paths: {
          pipAPI: 'API',
          text: ['//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.3/text.min', '../../bower_components/requirejs-text/text'],
          jquery: ['//cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min', '../../bower_components/jquery/jquery.min'],
          underscore: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.7.0/lodash.min', '../../bower_components/lodash-compat/lodash.min'],
          backbone: ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min', '../../bower_components/backbone/backbone']
        },
        packages: [
          {
            name: 'pipScorer',
            location: 'extensions/dscore',
            main: 'Scorer'
          }
        ]
      };

      // Load RequireJS
      const requireScript = document.createElement('script');
      requireScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.3/require.min.js';
      requireScript.onload = () => {
        // Initialize IAT after RequireJS is loaded
        initIAT();
      };
      document.head.appendChild(requireScript);
    } else {
      // RequireJS already loaded, just initialize IAT
      initIAT();
    }
  });

  function initIAT() {
    const req = (window as any).require;

    if (browser) {
      console.log("je set", onDone);
      (window as any).onIATDone = onDone;
    }
    req(['/iat-script.js'], function (iatScript: any) {
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

    :global(img) {
      display: block;
      margin: auto;
    }
  }
</style>