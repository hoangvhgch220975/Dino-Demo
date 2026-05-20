<template>
  <div class="flex items-center gap-3 mb-6">
    <h2 class="text-white/60 font-label-xs uppercase tracking-widest px-4 py-1 rounded-full border border-white/5 bg-white/5">
      {{ title }}
    </h2>
    <div class="h-px flex-1 bg-white/10"></div>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    title: { type: String, required: true },
  },
}
</script>
