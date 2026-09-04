<script lang="ts">
  import { authStore, logout } from '../lib/authStore';
  import { Link } from 'svelte-routing';

  $: user = $authStore.user;
</script>

<nav class="bg-slate-800 border-b border-slate-700 px-6 py-3.5 flex items-center justify-between shadow-md">
  <!-- Brand Logo -->
  <Link to="/" class="flex items-center gap-2 cursor-pointer">
    <span class="text-2xl font-black text-emerald-400 tracking-wider">仮名</span>
    <span class="text-lg font-bold text-white tracking-wide">Kana Quiz</span>
  </Link>

  <!-- Menu Navigation (Khusus User Login) -->
  {#if user}
    <div class="hidden md:flex items-center gap-6 text-sm font-medium">
      <Link 
        to="/" 
        class="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
        getProps={({ isCurrent }) => ({ class: isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-emerald-400' })}
      >
        Home
      </Link>
      
      <Link
        to="/quiz"
        class="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
        getProps={({ isCurrent }) => ({ class: isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-emerald-400' })}
      >
        Kuis
      </Link>

      <Link
        to="/leaderboard"
        class="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
        getProps={({ isCurrent }) => ({ class: isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-emerald-400' })}
      >
        Leaderboard
      </Link>
    </div>

    <!-- Profile & Logout -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
        {#if user.photoURL}
          <img src={user.photoURL} alt={user.displayName ?? 'User'} class="w-7 h-7 rounded-full border border-emerald-400/50" />
        {:else}
          <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-slate-900">
            {user.displayName?.charAt(0) ?? 'U'}
          </div>
        {/if}
        <span class="text-sm font-medium text-slate-200 hidden sm:inline">{user.displayName}</span>
      </div>

      <button 
        onclick={logout} 
        class="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm font-semibold rounded-xl transition-all cursor-pointer"
      >
        Logout
      </button>
    </div>
  {/if}
</nav>