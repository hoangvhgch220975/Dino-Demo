<template>
  <div
    class="absolute rounded-2xl overflow-hidden glass-panel glass-panel--strong noise-overlay"
    :class="[isExiting ? 'window-exit' : 'window-enter', { 'window--focus': isFocused }]"
    :style="windowStyle"
    @mousedown="$emit('focus')"
  >
    <!-- Title bar (drag handle) -->
    <div
      class="h-11 flex items-center justify-between px-3 bg-white/5 border-b border-white/10 select-none cursor-grab active:cursor-grabbing"
      @mousedown.stop="onDragStart"
      @dblclick="toggleMaximize"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center" :class="app.gradient">
          <span class="material-symbols-outlined text-white text-[18px]">{{ app.icon }}</span>
        </div>
        <div class="text-white/90 text-sm font-medium truncate">{{ app.title }}</div>
      </div>

      <div class="flex items-center gap-1">
        <button type="button" class="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Minimize" @click.stop="$emit('minimize')">
          <span class="material-symbols-outlined text-white/70 text-[20px]">remove</span>
        </button>
        <button type="button" class="p-2 hover:bg-white/10 rounded-full transition-colors" :aria-label="maximized ? 'Restore' : 'Maximize'" @click.stop="toggleMaximize">
          <span class="material-symbols-outlined text-white/70 text-[20px]">{{ maximized ? 'fullscreen_exit' : 'fullscreen' }}</span>
        </button>
        <button type="button" class="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close" @click.stop="$emit('close')">
          <span class="material-symbols-outlined text-white/70 text-[20px]">close</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-black/20" :style="{ height: `calc(100% - 44px)` }">
      <div v-if="isBlank" class="w-full h-full flex items-center justify-center p-8">
        <div class="max-w-md text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg" :class="app.gradient">
            <span class="material-symbols-outlined text-white text-[28px]">{{ app.icon }}</span>
          </div>
          <h3 class="mt-4 text-white text-lg font-semibold">{{ app.title }}</h3>
          <p class="mt-2 text-white/60 text-sm">
            Feature is coming soon. This window will load an iframe URL when the backend/app endpoint is ready.
          </p>
        </div>
      </div>

      <iframe
        v-else
        class="w-full h-full"
        :src="app.iframeUrl"
        title="App Iframe"
        frameborder="0"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppWindow',
  props: {
    app: { type: Object, required: true },
    rect: {
      type: Object,
      default: () => ({ x: 120, y: 120, w: 880, h: 560 }),
    },
    z: { type: Number, default: 1 },
    isFocused: { type: Boolean, default: false },
    isExiting: { type: Boolean, default: false },
    motion: {
      type: Object,
      default: () => ({ from: null, to: null }),
    },
    maximized: { type: Boolean, default: false },
    safeAreaLeft: { type: Number, default: 0 },
  },
  emits: ['focus', 'close', 'minimize', 'move', 'toggle-maximize'],
  data() {
    return {
      isDragging: false,
    }
  },
  computed: {
    isBlank() {
      const u = String(this.app?.iframeUrl || '')
      return !u || u === 'about:blank'
    },
    windowStyle() {
      const style = {
        position: 'absolute',
        zIndex: this.z,
      }

      if (this.maximized) {
        const safeLeft = (typeof this.safeAreaLeft === 'number' && this.safeAreaLeft > 0 && window.innerWidth >= 1024) ? this.safeAreaLeft : 0;
        style.left = `${safeLeft}px`
        style.top = '64px' // Place it exactly under the 64px TopNavBar
        // reduce width so it does not sit below side dock
        style.width = `${Math.max(0, window.innerWidth - safeLeft)}px`
        style.height = 'calc(100% - 64px)' // Take up remaining screen space
        style.borderRadius = '0px'
        style.zIndex = this.z + 100 // sit on top when maximized
      } else {
        style.left = `${this.rect.x}px`
        style.top = `${this.rect.y}px`
        style.width = `${this.rect.w}px`
        style.height = `${this.rect.h}px`
      }

      // Apply a smooth transition only when not dragging to prevent latency
      if (!this.isDragging) {
        style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }

      const from = this.motion?.from
      const to = this.motion?.to
      if (!this.isExiting && from && typeof from.x === 'number' && typeof from.y === 'number') {
        style['--win-from-x'] = `${from.x - (this.rect.x + this.rect.w / 2)}px`
        style['--win-from-y'] = `${from.y - (this.rect.y + this.rect.h)}px`
      }
      if (this.isExiting && to && typeof to.x === 'number' && typeof to.y === 'number') {
        style['--win-to-x'] = `${to.x - (this.rect.x + this.rect.w / 2)}px`
        style['--win-to-y'] = `${to.y - (this.rect.y + this.rect.h)}px`
      }

      return style
    },
  },
  methods: {
    toggleMaximize() {
      this.$emit('toggle-maximize')
    },
    onDragStart(e) {
      // left-button only
      if (e.button !== 0) return
      if (this.maximized) return

      this.isDragging = true
      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const startX = this.rect.x
      const startY = this.rect.y

      const onMove = (ev) => {
        const dx = ev.clientX - startMouseX
        const dy = ev.clientY - startMouseY

        // basic bounds (keep some part visible)
        const x = Math.max(20, Math.min(window.innerWidth - 120, startX + dx))
        const y = Math.max(64, Math.min(window.innerHeight - 80, startY + dy))

        this.$emit('move', { x, y })
      }

      const onUp = () => {
        this.isDragging = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
  },
}
</script>
