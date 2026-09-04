<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
  import { db } from '../lib/firebase';
  import { authStore } from '../lib/authStore';
  import type { QuizMode } from '../lib/kanaData';

  interface HighscoreEntry {
    id: string;
    uid: string;
    name: string;
    score: number;
    mode: string;
    createdAt: Date | null;
  }

  type ModeFilter = 'all' | QuizMode;

  // Filter mode dipisah karena tiap mode punya jumlah soal beda,
  // jadi skor antar mode nggak apple-to-apple kalau digabung.
  const MODE_FILTERS: Array<{ value: ModeFilter; label: string }> = [
    { value: 'all', label: 'Semua Mode' },
    { value: 'hiragana', label: 'Hiragana' },
    { value: 'katakana', label: 'Katakana' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'hiragana-word', label: 'Hiragana Word' },
    { value: 'katakana-word', label: 'Katakana Word' },
    { value: 'n5-kanji', label: 'N5 Kanji' },
    { value: 'n4-kanji', label: 'N4 Kanji' },
    { value: 'n3-kanji', label: 'N3 Kanji' }
  ];

  const MAX_ENTRIES_FETCHED = 200;
  const MAX_RANKS_SHOWN = 20;

  let allEntries = $state<HighscoreEntry[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);
  let selectedFilter = $state<ModeFilter>('all');

  let currentUid = $derived($authStore.user?.uid ?? null);

  // Leaderboard nunjukin skor TERBAIK per pemain (bukan tiap sesi main).
  // allEntries sudah terurut desc dari query, jadi entry pertama yang
  // ditemukan per uid otomatis adalah skor terbaiknya.
  let rankedEntries = $derived.by(() => {
    const filtered =
      selectedFilter === 'all'
        ? allEntries
        : allEntries.filter((entry) => entry.mode === selectedFilter);

    const bestByUser = new Map<string, HighscoreEntry>();
    for (const entry of filtered) {
      if (!bestByUser.has(entry.uid)) {
        bestByUser.set(entry.uid, entry);
      }
    }
    return Array.from(bestByUser.values()).slice(0, MAX_RANKS_SHOWN);
  });

  async function loadLeaderboard() {
    isLoading = true;
    errorMessage = null;

    try {
      const highscoresQuery = query(
        collection(db, 'highscores'),
        orderBy('score', 'desc'),
        limit(MAX_ENTRIES_FETCHED)
      );
      const snapshot = await getDocs(highscoresQuery);

      allEntries = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

        return {
          id: doc.id,
          uid: data.uid,
          name: data.name ?? 'Anonymous',
          score: data.score ?? 0,
          mode: data.mode ?? 'unknown',
          createdAt
        };
      });
    } catch (e) {
      console.error('Gagal memuat leaderboard:', e);
      errorMessage = 'Gagal memuat leaderboard. Coba lagi nanti.';
    } finally {
      isLoading = false;
    }
  }

  function getRankBadge(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  function formatDate(date: Date | null): string {
    if (!date) return '-';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatModeLabel(mode: string): string {
    return MODE_FILTERS.find((f) => f.value === mode)?.label ?? mode;
  }

  onMount(loadLeaderboard);
</script>

<div class="max-w-3xl mx-auto p-4 space-y-6">
  <div class="text-center space-y-3 my-6">
    <h1 class="text-3xl font-black text-white">🏆 Leaderboard</h1>
    <p class="text-slate-400 text-sm">Peringkat skor tertinggi para pemain Kana Quiz.</p>
  </div>

  <!-- Filter Mode -->
  <div class="flex flex-wrap gap-2 justify-center">
    {#each MODE_FILTERS as filter (filter.value)}
      <button
        onclick={() => (selectedFilter = filter.value)}
        class="px-4 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer
          {selectedFilter === filter.value
            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'}"
      >
        {filter.label}
      </button>
    {/each}
  </div>

  {#if isLoading}
    <div class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  {:else if errorMessage}
    <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center p-6 rounded-2xl space-y-3">
      <p>{errorMessage}</p>
      <button
        onclick={loadLeaderboard}
        class="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
      >
        Coba Lagi
      </button>
    </div>
  {:else if rankedEntries.length === 0}
    <div class="bg-slate-800 border border-slate-700 text-slate-400 text-sm text-center p-10 rounded-2xl">
      Belum ada skor untuk mode ini. Yuk main dulu!
    </div>
  {:else}
    <div class="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-lg divide-y divide-slate-700/60">
      {#each rankedEntries as entry, index (entry.uid)}
        {@const rank = index + 1}
        {@const isCurrentUser = entry.uid === currentUid}
        <div
          class="flex items-center gap-4 px-5 py-4 transition-colors {isCurrentUser ? 'bg-emerald-500/10' : 'hover:bg-slate-750'}"
        >
          <span class="w-10 text-center text-lg font-black {rank <= 3 ? '' : 'text-slate-500'}">
            {getRankBadge(rank)}
          </span>

          <div class="flex-1 min-w-0">
            <p class="font-bold text-white truncate">
              {entry.name}
              {#if isCurrentUser}
                <span class="text-[10px] font-semibold text-emerald-400 align-middle">(Kamu)</span>
              {/if}
            </p>
            <p class="text-xs text-slate-400">
              {formatModeLabel(entry.mode)} &middot; {formatDate(entry.createdAt)}
            </p>
          </div>

          <span class="text-xl font-black text-emerald-400">{entry.score}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
