<template>
  <div
    class="relative flex flex-col items-center gap-1 group select-none focus:outline-none w-[60px]"
    :class="{ 'jiggle cursor-move': isEditMode, 'cursor-grab active:cursor-grabbing': !isEditMode }"
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
      <span class="material-symbols-outlined">close</span>
    </div>

    <!-- Toggle mode button -->
    <div
      v-if="isEditMode && hovered && isEligibleForWidget && !owner"
      class="widget-toggle-btn"
      title="Đổi thành Widget"
      @click.stop="$emit('toggle-mode', appId || label)"
    >
      <span class="material-symbols-outlined">widgets</span>
    </div>
    <div v-if="owner" class="owner-badge" :title="owner.name || owner.id"></div>
    <div v-if="owner" class="owner-tooltip">{{ owner.name || owner.id }}</div>

    <div class="app-icon w-[46px] h-[46px] rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" :class="[gradient, isSelected ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-black/40 scale-105' : '']">
      <img v-if="iconImage" :src="iconImage" :alt="label" class="h-full w-full rounded-xl object-cover" />
      <span v-else-if="fallbackLetter" class="text-white text-[22px] font-extrabold uppercase leading-none">{{ fallbackLetter }}</span>
      <span v-else class="material-symbols-outlined text-white text-[24px]">{{ icon }}</span>
    </div>
    <button
      v-if="allowIconUpload && isEditMode && hovered"
      class="upload-btn"
      title="Upload logo"
      @click.stop="triggerIconUpload"
    >
      <span class="material-symbols-outlined">photo_camera</span>
    </button>
    <input
      v-if="allowIconUpload"
      ref="iconInput"
      type="file"
      class="hidden"
      accept="image/*"
      @change="onIconFileChange"
    />
    <span class="text-white text-shadow text-center text-[10px] leading-tight line-clamp-2 break-words w-full">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'AppIconTile',
  props: {
    appId: { type: String, default: '' },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    gradient: { type: String, default: 'from-slate-600 to-slate-800' },
    isEditMode: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    position: { type: Object, default: null },
    owner: { type: Object, default: null },
    isSelected: { type: Boolean, default: false },
    iconImage: { type: String, default: '' },
    fallbackLetter: { type: String, default: '' },
    allowIconUpload: { type: Boolean, default: false },
  },
  emits: ['open', 'remove', 'enable-edit', 'dragstart', 'icon-upload', 'toggle-mode'],
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
      if (this.isEditMode) return;
      this.cancelLongPress();
      this._longPressEvent = e || null;
      this.longPressTimer = setTimeout(() => {
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
      this.cancelLongPress();
      try {
        event.dataTransfer.setData('application/x-app-label', this.label);
        event.dataTransfer.setData('text/plain', this.label);
      } catch (e) {
        // ignore
      }
      this.$emit('dragstart', event);
    },
    triggerIconUpload() {
      if (this.$refs.iconInput) this.$refs.iconInput.click();
    },
    onIconFileChange(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.$emit('icon-upload', { label: this.label, dataUrl: e.target.result });
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    },
  },
  mounted() {
    // no-op
  },
  computed: {
    isEligibleForWidget() {
      const id = (this.appId || this.label || '').toLowerCase();
      return ['talk', 'mail', 'file', 'files', 'activity', 'announcement', 'note', 'notes'].includes(id);
    },
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
  left: auto !important;
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
  z-index: 60;
}

.delete-btn.hidden { display: none; }

.widget-toggle-btn {
  position: absolute;
  top: -6px;
  left: -6px;
  right: auto !important;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14,165,233,0.95);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
  color: white;
  font-size: 10px;
  cursor: pointer;
  z-index: 60;
}

.widget-toggle-btn .material-symbols-outlined {
  font-size: 10px;
}

.upload-btn {
  position: absolute;
  right: -8px;
  bottom: 16px;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14,165,233,0.95);
  box-shadow: 0 6px 12px rgba(0,0,0,0.35);
  color: white;
  border: 1px solid rgba(255,255,255,0.35);
}

.upload-btn .material-symbols-outlined {
  font-size: 12px;
}
</style>
