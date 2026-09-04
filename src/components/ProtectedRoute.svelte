<script lang="ts">
  import { authStore } from '../lib/authStore';
  import { goto } from 'svelte-pathfinder';

  $: ({ user, loading } = $authStore);

  $: if (!loading && !user) {
    goto('/login');
  }
</script>

{#if loading}
  <div class="min-h-[calc(100vh-65px)] flex items-center justify-center">
    <div class="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent"></div>
  </div>
{:else if user}
  <!-- Jika sudah login, tampilkan konten halamannya -->
  <slot />
{/if}