<template>
  <nav 
    data-side-dock="true"
    class="fixed z-50 bg-surface-container-highest/20 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 flex
           /* Desktop: Side Left */
           lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:px-3 lg:py-6 lg:rounded-2xl lg:gap-[5px]
           /* Mobile/Tablet: Bottom Center */
           left-1/2 bottom-4 -translate-x-1/2 flex-row px-4 py-2 rounded-xl max-w-[95vw] overflow-x-auto no-scrollbar gap-[5px]"
    @contextmenu.prevent
  >
    <div
      v-for="app in apps"
      :key="app.key"
      class="relative flex flex-col items-center group cursor-pointer focus:outline-none shrink-0"
    >
      <!-- Tooltip Tên App (Ẩn trên mobile) -->
      <div class="hidden lg:block absolute left-16 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {{ app.title }}
      </div>

      <!-- Nút tắt app (Close) -->
      <button 
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/20 hover:bg-red-600"
        @click.stop="$emit('close', app.key)"
      >
        <span class="material-symbols-outlined text-white text-[12px]">close</span>
      </button>

      <div 
        class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transform transition-all group-hover:scale-110 group-hover:translate-x-1" 
        :class="[app.gradient, app.key === activeKey ? 'ring-[3px] ring-white/60 scale-110 brightness-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'opacity-70 hover:opacity-100']"
        @click="$emit('open', app.key)"
      >
        <span class="material-symbols-outlined text-white text-[22px] lg:text-[26px]">{{ app.icon }}</span>
      </div>
      
      <!-- Indicator: Chuyển vị trí tùy theo hướng của Dock -->
      <div 
        v-if="app.key === activeKey" 
        class="absolute rounded-full bg-secondary shadow-[0_0_8px_rgba(173,198,255,0.8)]
               lg:-left-1.5 lg:top-1/2 lg:-translate-y-1/2 lg:w-1 lg:h-3
               bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-1"
      ></div>
      <div 
        v-else 
        class="absolute rounded-full bg-white/40
               lg:-left-1.5 lg:top-1/2 lg:-translate-y-1/2 lg:w-1 lg:h-1.5
               bottom-[-6px] left-1/2 -translate-x-1/2 w-1.5 h-1"
      ></div>
    </div>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<script>
export default {
  name: 'SideDock',
  props: {
    apps: { type: Array, default: () => [] },
    activeKey: { type: String, default: '' }
  },
  emits: ['open', 'close']
}
</script>
