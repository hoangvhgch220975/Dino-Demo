<template>
  <div
    class="relative flex flex-col items-center gap-2 group cursor-pointer select-none focus:outline-none"
    :class="{ 'jiggle': isEditMode }"
    :draggable="draggable"
    :data-label="label"
    :style="positionStyle"
    @mousedown="startLongPress"
    @mouseup="cancelLongPress"
    @mouseleave="cancelLongPress; hovered = false"
    @mouseenter="hovered = true"
    @touchstart="startLongPress"
    @touchend="cancelLongPress"
    @dragstart="onDragStart"
    @click="handleClick"
  >
    <!-- Nút xóa -->
    <div 
      v-if="isEditMode && hovered"
      class="delete-btn"
      @click.stop="$emit('remove', label)"
    >
    <div v-if="owner" class="owner-badge" :title="owner.name || owner.id"></div>
    <div v-if="owner" class="owner-tooltip">{{ owner.name || owner.id }}</div>
      <span class="material-symbols-outlined">close</span>
    </div>

    <div class="app-icon rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" :class="gradient">
      <span class="material-symbols-outlined text-white text-[24px]">{{ icon }}</span>
    </div>
    <span class="text-white font-label-sm text-label-sm text-shadow text-center">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'AppIconTile',
  props: {
    label: { type: String, required: true },
    icon: { type: String, required: true },
    gradient: { type: String, default: 'from-slate-600 to-slate-800' },
    isEditMode: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    position: { type: Object, default: null },
    owner: { type: Object, default: null },
  },
  emits: ['open', 'remove', 'enable-edit', 'dragstart'],
  data() {
    return {
      longPressTimer: null,
      hovered: false,
    }
  },
  methods: {
    handleClick() {
      if (this.isEditMode) return;
      this.$emit('open', this.label);
    },
    startLongPress(e) {
      if (this.isEditMode) return; // If already in edit mode don't start
      this.cancelLongPress();
      this._longPressEvent = e || null;
      this.longPressTimer = setTimeout(() => {
        // emit the event so parent can know which element triggered long-press
        try { this.$emit('enable-edit', this._longPressEvent); } catch (err) { this.$emit('enable-edit'); }
        this.longPressTimer = null;
        this._longPressEvent = null;
      }, 1000);
    },
    cancelLongPress() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        this._longPressEvent = null;
      }
    },
    onDragStart(event) {
      // Prevent default long-press cancellation
      this.cancelLongPress();
      try {
        event.dataTransfer.setData('application/x-app-label', this.label);
        event.dataTransfer.setData('text/plain', this.label);
      } catch (e) {
        // Some environments disallow programmatic dataTransfer (e.g. mobile browsers)
        // ignore silently
      }
      this.$emit('dragstart', event);
    },
  },
  mounted() {
    // no-op
  },
  computed: {
    positionStyle() {
      if (this.position && typeof this.position.x === 'number') {
          const style = {
            position: 'absolute',
            left: `${this.position.x}px`,
            zIndex: this.isEditMode ? 50 : 20,
          }
          if (typeof this.position.y === 'number') {
            style.top = `${this.position.y}px`
          } else if (typeof this.position.bottom === 'number') {
            style.bottom = `${this.position.bottom}px`
          }
          return style
        }
      return {}
    }
  }
}
</script>

<style scoped>
.owner-badge {
  position: absolute;
  left: -6px;
  top: -6px;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: rgba(59,130,246,0.95);
  border: 2px solid rgba(255,255,255,0.85);
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);
}
.owner-tooltip {
  position: absolute;
  left: 12px;
  top: -6px;
  background: rgba(0,0,0,0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  transform: translateY(-100%);
  display: none;
}
.group:hover .owner-tooltip { display: block; }
</style>

<style scoped>
.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220,38,38,0.95);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
  color: white;
  font-size: 10px;
}

.delete-btn.hidden { display: none; }
</style>
