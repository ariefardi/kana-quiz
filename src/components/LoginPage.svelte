<script lang="ts">
  import { loginWithGoogle } from '../lib/authStore';
</script>

<div class="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4">
  <div class="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6">
    <!-- Icon / Header -->
    <div class="space-y-2">
      <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
        あ
      </div>
      <h1 class="text-2xl font-bold text-white tracking-tight">Selamat Datang!</h1>
      <p class="text-slate-400 text-sm">
        Belajar & Kuasai Hiragana dan Katakana dengan metode quiz interaktif.
      </p>
    </div>

    <!-- Tombol Login Google -->
    <button
      onclick={loginWithGoogle}
      class="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
        />
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
        />
        <path
          fill="#FBBC05"
          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
        />
        <path
          fill="#34A853"
          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
        />
      </svg>
      Lanjut dengan Google
    </button>

    <p class="text-xs text-slate-500">
      Dengan masuk, skor dan progress belajar kamu bakal otomatis tersimpan.
    </p>
  </div>
</div>