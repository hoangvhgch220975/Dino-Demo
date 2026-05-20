<template>
  <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 bg-surface-container-highest/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50">
    <button
      v-for="w in windows"
      :key="w.key"
      type="button"
      class="dock-tab btn-press flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors"
      :data-dock-key="w.key"
      :class="w.key === activeKey ? 'bg-white/10 border-white/20' : 'bg-white/5 hover:bg-white/10 border-white/10'"
      @click="$emit('activate', w.key)"
    >
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center" :class="w.gradient">
        <span class="material-symbols-outlined text-white text-[18px]">{{ w.icon }}</span>
      </div>
      <span class="text-white/80 text-sm max-w-[120px] truncate">{{ w.title }}</span>
      <span v-if="w.key === activeKey" class="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(173,198,255,0.8)]"></span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'DockTabs',
  props: {
    windows: { type: Array, default: () => [] },
    activeKey: { type: String, default: '' },
  },
  emits: ['activate'],
}
</script>
