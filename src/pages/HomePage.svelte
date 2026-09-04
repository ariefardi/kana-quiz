
<script lang="ts">
  import { Link } from 'svelte-routing';
  import { router } from 'tinro';
</script>

<div class="p-8 max-w-4xl mx-auto space-y-6 text-center">
  <h1 class="text-3xl font-extrabold text-white">Dashboard Utama</h1>
  <p class="text-slate-400">Pilih menu untuk memulai kuis kamu!</p>

  <div class="flex justify-center gap-4 mt-5">
    <Link  to="/quiz"
      
      class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl transition-all cursor-pointer">
      Mulai Kuis
    </Link>
  </div>
</div>