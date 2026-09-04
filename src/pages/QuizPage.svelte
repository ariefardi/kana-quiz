<script lang="ts">
  import { 
    getKanaDataByMode, 
    getRandomOptions, 
    type Kana, 
    type QuizMode 
  } from '../lib/kanaData';
  import { db, auth } from '../lib/firebase';
  import { collection, addDoc } from 'firebase/firestore';

  type AccentColor = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'fuchsia';

  interface ModeCard {
    mode: QuizMode;
    icon: string;
    title: string;
    description: string;
    accent: AccentColor;
  }

  // Tambah mode kuis baru cukup dengan menambah entry di sini, tanpa nulis card baru.
  const MODE_CARDS: ModeCard[] = [
    {
      mode: 'hiragana',
      icon: 'あ',
      title: 'Hiragana Only',
      description: 'Karakter dasar bahasa Jepang (あ, い, う, え, お...).',
      accent: 'emerald'
    },
    {
      mode: 'katakana',
      icon: 'ア',
      title: 'Katakana Only',
      description: 'Karakter untuk kata serapan asing (ア, イ, ウ, エ, オ...).',
      accent: 'blue'
    },
    {
      mode: 'mixed',
      icon: 'あ/ア',
      title: 'Mixed Mode',
      description: 'Tantangan kombinasi Hiragana dan Katakana sekaligus!',
      accent: 'purple'
    },
    {
      mode: 'hiragana-word',
      icon: 'ねこ',
      title: 'Hiragana Word',
      description: 'Tebak gabungan 2-5 karakter Hiragana sekaligus, lebih susah dari 1 karakter!',
      accent: 'amber'
    },
    {
      mode: 'katakana-word',
      icon: 'コネ',
      title: 'Katakana Word',
      description: 'Tebak gabungan 2-5 karakter Katakana sekaligus, lebih susah dari 1 karakter!',
      accent: 'rose'
    },
    {
      mode: 'n5-kanji',
      icon: '日',
      title: 'N5 Kanji',
      description: 'Hafalin cara baca 80 kanji dasar level JLPT N5.',
      accent: 'cyan'
    },
    {
      mode: 'n4-kanji',
      icon: '会',
      title: 'N4 Kanji',
      description: 'Naik level, hafalin cara baca 167 kanji JLPT N4.',
      accent: 'indigo'
    },
    {
      mode: 'n3-kanji',
      icon: '政',
      title: 'N3 Kanji',
      description: 'Tantangan berat: 370 kanji JLPT N3 buat yang udah jago!',
      accent: 'fuchsia'
    }
  ];

  // Kelas Tailwind harus ditulis lengkap di sini (bukan hasil template string)
  // supaya tetap terdeteksi oleh Tailwind JIT scanner.
  const ACCENT_STYLES: Record<AccentColor, { border: string; text: string }> = {
    emerald: { border: 'hover:border-emerald-500/50', text: 'text-emerald-400' },
    blue: { border: 'hover:border-blue-500/50', text: 'text-blue-400' },
    purple: { border: 'hover:border-purple-500/50', text: 'text-purple-400' },
    amber: { border: 'hover:border-amber-500/50', text: 'text-amber-400' },
    rose: { border: 'hover:border-rose-500/50', text: 'text-rose-400' },
    cyan: { border: 'hover:border-cyan-500/50', text: 'text-cyan-400' },
    indigo: { border: 'hover:border-indigo-500/50', text: 'text-indigo-400' },
    fuchsia: { border: 'hover:border-fuchsia-500/50', text: 'text-fuchsia-400' }
  };

  // Ukuran font soal disesuaikan sama panjang kana biar kata 3-5 karakter nggak overflow.
  const KANA_FONT_SIZE_BY_LENGTH: Record<number, string> = {
    1: 'text-8xl',
    2: 'text-7xl',
    3: 'text-6xl',
    4: 'text-5xl'
  };
  const KANA_FONT_SIZE_FALLBACK = 'text-4xl';

  function getKanaFontSize(length: number): string {
    return KANA_FONT_SIZE_BY_LENGTH[length] ?? KANA_FONT_SIZE_FALLBACK;
  }

  // State Pilihan Mode (null = belum milih / masih di halaman pilih card)
  let selectedMode = $state<QuizMode | null>(null);

  // Game State
  let questions = $state<Kana[]>([]);
  let currentQuestionIndex = $state(0);
  let score = $state(0);
  let streak = $state(0);
  let isGameOver = $state(false);
  let selectedAnswer = $state<string | null>(null);
  let isCorrect = $state<boolean | null>(null);
  let isSaving = $state(false);

  // Derived state untuk soal yang sedang aktif
  let currentQuestion = $derived(questions[currentQuestionIndex]);
  let options = $derived(
    currentQuestion && questions.length > 0
      ? getRandomOptions(currentQuestion, questions)
      : []
  );
  let selectedModeLabel = $derived(
    MODE_CARDS.find((card) => card.mode === selectedMode)?.title ?? selectedMode
  );

  // Fungsi Mulai Game berdasarkan Mode
  function startQuiz(mode: QuizMode) {
    selectedMode = mode;
    const dataPool = getKanaDataByMode(mode);
    questions = [...dataPool].sort(() => 0.5 - Math.random());
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    isGameOver = false;
    selectedAnswer = null;
    isCorrect = null;
  }

  // Cek Jawaban
  function handleAnswer(answer: string) {
    if (selectedAnswer !== null) return;

    selectedAnswer = answer;
    if (answer === currentQuestion.romaji) {
      isCorrect = true;
      score += 10;
      streak += 1;
    } else {
      isCorrect = false;
      streak = 0;
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        currentQuestionIndex += 1;
        selectedAnswer = null;
        isCorrect = null;
      } else {
        isGameOver = true;
      }
    }, 900);
  }

  // Simpan Skor ke Firestore
  async function saveScoreToFirebase() {
    if (!auth.currentUser || !selectedMode) return;
    isSaving = true;

    try {
      await addDoc(collection(db, 'highscores'), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName ?? 'Anonymous',
        score: score,
        mode: selectedMode,
        createdAt: new Date()
      });
      alert('Skor berhasil disimpan!');
    } catch (e) {
      console.error('Gagal simpan skor:', e);
    } finally {
      isSaving = false;
    }
  }

  function backToModeSelection() {
    selectedMode = null;
    isGameOver = false;
  }
</script>

<div class="max-w-3xl mx-auto p-4 space-y-6">
  {#if selectedMode === null}
    <!-- ============================================== -->
    <!-- FASE 1: LIST CARD PILIHAN MODE                -->
    <!-- ============================================== -->
    <div class="text-center space-y-3 my-6">
      <h1 class="text-3xl font-black text-white">Pilih Mode Kuis</h1>
      <p class="text-slate-400 text-sm">Tentukan karakter Kana mana yang ingin kamu uji hari ini.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each MODE_CARDS as card (card.mode)}
        <button
          onclick={() => startQuiz(card.mode)}
          class="bg-slate-800 hover:bg-slate-750 border border-slate-700 {ACCENT_STYLES[card.accent].border} p-6 rounded-3xl text-left transition-all duration-200 group shadow-lg flex flex-col justify-between h-52 cursor-pointer active:scale-95"
        >
          <div class="space-y-2">
            <span class="text-3xl font-black {ACCENT_STYLES[card.accent].text} group-hover:scale-110 transition-transform inline-block">{card.icon}</span>
            <h2 class="text-xl font-bold text-white">{card.title}</h2>
            <p class="text-xs text-slate-400 leading-relaxed">{card.description}</p>
          </div>
          <span class="text-xs font-semibold {ACCENT_STYLES[card.accent].text} flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Mulai Kuis &rarr;
          </span>
        </button>
      {/each}
    </div>

  {:else}
    <!-- ============================================== -->
    <!-- FASE 2: GAMEPLAY KUIS                          -->
    <!-- ============================================== -->
    <div class="flex items-center justify-between">
      <button 
        onclick={backToModeSelection}
        class="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
      >
        &larr; Ganti Mode
      </button>

      <span class="text-xs font-bold px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300">
        Mode: {selectedModeLabel}
      </span>
    </div>

    {#if isGameOver}
      <!-- Screen Game Over -->
      <div class="bg-slate-800 border border-slate-700 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
        <h2 class="text-3xl font-black text-emerald-400">Kuis Selesai! 🎉</h2>
        <div class="space-y-1">
          <p class="text-slate-400">Total Skor Kamu ({selectedModeLabel}):</p>
          <p class="text-5xl font-black text-white">{score}</p>
        </div>

        <div class="flex gap-3 justify-center">
          <button
            onclick={() => startQuiz(selectedMode!)}
            class="px-5 py-3 bg-slate-700 hover:bg-slate-600 font-bold rounded-xl transition-all cursor-pointer"
          >
            Main Lagi
          </button>
          <button
            onclick={saveScoreToFirebase}
            disabled={isSaving}
            class="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Skor'}
          </button>
        </div>
      </div>
    {:else if currentQuestion}
      <!-- Status Header -->
      <div class="flex items-center justify-between bg-slate-800 border border-slate-700/80 px-6 py-4 rounded-2xl">
        <div>
          <p class="text-xs text-slate-400">Soal</p>
          <p class="text-lg font-bold text-white">{currentQuestionIndex + 1} / {questions.length}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">Streak 🔥</p>
          <p class="text-lg font-bold text-amber-400 text-center">{streak}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">Skor</p>
          <p class="text-lg font-bold text-emerald-400 text-right">{score}</p>
        </div>
      </div>

      <!-- Card Karakter Kana -->
      <div class="bg-slate-800 border border-slate-700 p-12 rounded-3xl text-center shadow-xl space-y-2">
        <span class="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 capitalize">
          {currentQuestion.type}
        </span>
        <h1 class="{getKanaFontSize(currentQuestion.kana.length)} font-black text-white tracking-wide pt-4 break-words">{currentQuestion.kana}</h1>
      </div>

      <!-- Pilihan Jawaban (4 Grid) -->
      <div class="grid grid-cols-2 gap-4">
        {#each options as option}
          {@const isSelected = selectedAnswer === option}
          {@const isRight = option === currentQuestion.romaji}
          
          <button
            onclick={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
            class="p-5 text-xl font-bold rounded-2xl border transition-all duration-200 cursor-pointer shadow-md break-words
              {selectedAnswer === null
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:border-emerald-500/50' 
                : isRight 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                  : isSelected 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'}"
          >
            {option}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>