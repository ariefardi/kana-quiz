<script lang="ts">
  import { Router, Route, navigate } from 'svelte-routing';
  import { authStore } from './lib/authStore';
  import Navbar from './components/Navbar.svelte';
  import ProtectedRoute from './components/ProtectedRoute.svelte';
  import LoginPage from './components/LoginPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import QuizPage from './pages/QuizPage.svelte';
  import LeaderboardPage from './pages/LeaderboardPage.svelte';

  $: ({ user, loading } = $authStore);

  $: if (!loading && user && window.location.pathname === '/login') {
    navigate('/', { replace: true });
  }
</script>

<Router>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
    <Navbar />

    <Route path="/login" component={LoginPage} />

    <Route path="/">
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    </Route>

    <Route path="/quiz">
      <ProtectedRoute>
        <QuizPage />
      </ProtectedRoute>
    </Route>

    <Route path="/leaderboard">
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    </Route>
  </div>
</Router>