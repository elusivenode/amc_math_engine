<script lang="ts">
  import { onMount } from 'svelte';

  export let expression: string;
  export let inline = false;
  export let options: Record<string, unknown> = {};

  let container: HTMLElement | null = null;

  async function typeset() {
    if (!container || !expression) return;
    const katex = await import('katex');
    katex.render(expression, container, {
      displayMode: !inline,
      throwOnError: false,
      ...options
    });
  }

  onMount(() => {
    typeset();
    return () => {
      if (container) container.innerHTML = '';
    };
  });

  $: if (container) {
    typeset();
  }
</script>

<span bind:this={container} class={inline ? 'inline-block align-middle' : 'block my-4'} aria-hidden="true"></span>
