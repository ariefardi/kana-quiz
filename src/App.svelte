<script lang="ts">
  import { path } from 'svelte-pathfinder';
  import { authStore } from './lib/authStore';
  import Navbar from './components/Navbar.svelte';
  import ProtectedRoute from './components/ProtectedRoute.svelte';
  import LoginPage from './components/LoginPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import QuizPage from './pages/QuizPage.svelte';

  $: ({ user, loading } = $authStore);
  
  // Ambil path string utama
  $: currentPath = $path.toString();
</script>

<div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
  <Navbar />

  {#if currentPath === '/login'}
    <LoginPage />
  {:else if currentPath === '/quiz'}
    <ProtectedRoute>
      <QuizPage />
    </ProtectedRoute>
  {:else}
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  {/if}
</div>