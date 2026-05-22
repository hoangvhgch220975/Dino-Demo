<template>
  <div
    ref="root"
    class="absolute pointer-events-auto group/widget"
    :style="positionStyle"
    :data-widget-id="id"
    @mousedown="onMouseDown"
    @pointerdown.stop="onPointerDown"
    @click.stop
  >
    <div :class="['rounded-lg px-4 py-2 shadow-lg text-white/80 border border-white/10 backdrop-blur-md flex flex-col gap-2 transition-colors group-hover/widget:border-white/25', containerClass]" style="width: fit-content; min-width: 200px;" @dragover.prevent @drop.stop.prevent="onWidgetDrop">
      <div class="flex items-center justify-between gap-2">
        <div
          class="flex flex-1 items-center gap-3 cursor-pointer rounded-md transition-colors hover:bg-white/5"
          @click.stop="onHeaderClick"
          @pointerdown.stop="onHeaderPointerDown"
          @pointerup.stop="onHeaderPointerUp"
          @pointercancel.stop="onHeaderPointerCancel"
          @mouseleave.stop="onHeaderPointerCancel"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-md bg-white/6">
            <span class="material-symbols-outlined text-white text-[18px]">folder</span>
          </div>
          <div class="rounded-full bg-white/6 px-3 py-1 text-[12px] font-bold uppercase tracking-wider select-none">
            <div @dblclick.stop="requestRename">
              <div class="select-none">{{ text }}</div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isEditMode && canRenameGroup"
            class="hidden h-7 w-7 items-center justify-center rounded-md bg-white/6 text-white/65 opacity-0 transition hover:bg-white/12 hover:text-white group-hover/widget:flex group-hover/widget:opacity-100"
            title="Đổi tên group"
            @pointerdown.stop
            @click.stop="requestRename"
          >
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button v-if="isEditMode" class="px-2 py-1 rounded bg-red-600 text-white" @click.stop="$emit('remove', id)">✕</button>
        </div>
      </div>

      <transition name="fade">
        <div v-show="!collapsed" class="mt-3">
          <!--
            ========================================================================
            TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (DỮ LIỆU WIDGET THẬT LẤY TỪ BE)
            ========================================================================
            Hiện tại các Widget như Nhãn nhóm (label), Thời gian (time), Tìm kiếm (search) đang
            chạy bằng dữ liệu tĩnh/local state.
            Khi tích hợp hệ thống Cloud cũ nội bộ:
            
            1. Widget Nhãn Nhóm (label):
               - Tải danh sách các ứng dụng con (`items` hay `appIds`) thuộc nhóm này từ DB của user.
               - Khi kéo thả thêm/bớt app vào nhóm, gọi API cập nhật cấu trúc nhóm lên DB:
                 POST https://api.dinocloud.internal/v1/widgets/update-items
                 Body: { widgetId: this.id, appIds: this.appIds }
            
            2. Các loại Widgets phức tạp hơn (ví dụ: Task Widget, Mail Widget, Activity Widget):
               - Mỗi widget sẽ tự động gửi request lấy dữ liệu động của chính nó:
                 GET https://api.dinocloud.internal/v1/widgets/data?type=activity
               - Hiển thị danh sách hoạt động, email mới hoặc công việc cần làm trực tiếp trong widget
                 thay vì hiển thị icon đơn thuần.
            ========================================================================
          -->
          <div v-if="type === 'label'">
            <div v-if="items && items.length" class="grid gap-3" style="grid-template-columns: repeat(6, 60px);">
              <AppIconTile
                v-for="(it, idx) in items"
                :key="(it && (it.key || it.label)) ? (it.key || it.label) : idx"
                :label="(it && (it.title || it.label)) ? (it.title || it.label) : it"
                :icon="(it && it.icon) ? it.icon : 'apps'"
                :gradient="(it && it.gradient) ? it.gradient : 'from-slate-600 to-slate-800'"
                :icon-image="isProductGroup ? ((it && it.productIconUrl) || '') : ''"
                :fallback-letter="isProductGroup ? firstLetter((it && (it.title || it.label)) ? (it.title || it.label) : it) : ''"
                :allow-icon-upload="isProductGroup"
                :is-edit-mode="isEditMode"
                :owner="ownerMap[(it && (it.key || it.label)) ? (it.key || it.label) : it]"
                :draggable="isEditMode"
                @dragstart.stop="onAppDragStart($event, it)"
                @enable-edit.stop="onAppLongPressEvent($event, it)"
                @open="$emit('open', $event)"
                @dragover.prevent
                @drop.stop.prevent="onItemDrop(it, idx, $event)"
                @remove="onRemoveItem"
                @icon-upload="onProductIconUpload"
              />
            </div>
          </div>
          <div v-else-if="type === 'time'" class="text-xl font-bold">{{ time }}</div>
          <div v-else-if="type === 'search'"><input placeholder="Search..." class="bg-white/10 rounded px-3 py-1 text-white w-full" /></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WidgetTile',
  components: {
    AppIconTile: require('./AppIconTile.vue').default
  },
  props: {
    id: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: Object, default: () => ({}) },
    items: { type: Array, default: () => [] },
    isEditMode: { type: Boolean, default: false },
    position: { type: Object, default: null },
    ownerMap: { type: Object, default: () => ({}) },
  },
  emits: ['remove', 'pointerdown', 'dragstart', 'app-dragstart', 'child-longpress', 'update-content', 'rename-request', 'drop-into', 'open', 'enable-edit', 'start-drag', 'remove-from-widget', 'measure', 'icon-upload'],
  data() {
    return {
      editing: false,
      text: this.content.text || this.content.label || 'Label',
      time: this.getTime(),
      timerId: null,
      dragging: false,
      collapsed: (this.content && typeof this.content.collapsed === 'boolean') ? this.content.collapsed : false,
      headerLongPressed: false,
    }
  },
  computed: {
    positionStyle() {
      if (this.position) {
        const s = { position: 'absolute', left: `${this.position.x}px` };
        if (typeof this.position.y === 'number') s.top = `${this.position.y}px`;
        else if (typeof this.position.bottom === 'number') s.bottom = `${this.position.bottom}px`;
        return s;
      }
      return {}
    },
    containerClass() {
      return this.isEditMode ? 'bg-white/6' : 'bg-white/5';
    },
    isProductGroup() {
      return this.id === 'label_products' || (this.content && (this.content.text === 'Product' || this.content.label === 'Product'));
    },
    canRenameGroup() {
      return this.id !== 'label_apps' && this.id !== 'label_products';
    }
  },
  watch: {
    items: {
      handler() {
        this.$nextTick(() => {
          this.emitMeasure();
          window.setTimeout(this.emitMeasure, 80);
        });
      },
      deep: true,
    },
    position() {
      this.$nextTick(this.emitMeasure);
    },
    content: {
      handler(next) {
        this.text = (next && (next.text || next.label)) || 'Label';
      },
      deep: true,
    },
  },
  mounted() {
    if (this.type === 'time') {
      this.timerId = setInterval(() => { this.time = this.getTime(); }, 1000);
    }
    this.$nextTick(this.emitMeasure);
  },
  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId);
  },
  methods: {
    getTime() {
      return new Date().toLocaleTimeString();
    },
    requestRename() {
      if (!this.canRenameGroup) return;
      this.$emit('rename-request', { id: this.id, text: this.text });
    },
    onMouseDown(e) {
      if (!this.isEditMode) return;
      this.$emit('dragstart', e, this.id);
    },
    onPointerDown(e) {
      if (!this.isEditMode) return;
      if (e.target.closest('button') || e.target.closest('input')) return;
      this.$emit('pointerdown', e);
    },
    onAppDragStart(ev, it) {
      // Only allow drag from inside a group when in edit mode
      if (!this.isEditMode) return;
      this.$emit('app-dragstart', ev, { widgetId: this.id, item: it });
    },
    onAppLongPressEvent(ev, it) {
      this.$emit('enable-edit', this.id);
      this.$emit('child-longpress', { widgetId: this.id, item: it, event: ev });
    },
    onItemDrop(targetItem, idx, e) {
      const label = e.dataTransfer.getData('application/x-app-label') || e.dataTransfer.getData('text/plain') || (window.__dino_drag_payload && window.__dino_drag_payload.label);
      if (!label) return;
      this.$emit('drop-into', { id: this.id, label, targetLabel: targetItem.label || targetItem, index: idx });
    },
    onWidgetDrop(e) {
      const label = e.dataTransfer.getData('application/x-app-label') || e.dataTransfer.getData('text/plain') || (window.__dino_drag_payload && window.__dino_drag_payload.label);
      if (!label) return;
      this.$emit('drop-into', { id: this.id, label });
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit('update-content', { id: this.id, content: { collapsed: this.collapsed } });
      this.$nextTick(() => {
        this.emitMeasure();
        window.setTimeout(this.emitMeasure, 80);
        window.setTimeout(this.emitMeasure, 260);
      });
    },
    onHeaderClick() {
      if (this.editing || this.headerLongPressed) {
        this.headerLongPressed = false;
        return;
      }
      this.toggleCollapse();
    },
    onHeaderPointerDown(e) {
      if (!e) return;
      this.cancelHeaderLongPress();
      this._headerLongPressEvent = e;
      this.headerLongPressed = false;
      this._headerLongPressTimer = window.setTimeout(() => {
        this.headerLongPressed = true;
        this.$emit('enable-edit', this.id);
        this.$emit('start-drag', this._headerLongPressEvent, this.id);
        this._headerLongPressTimer = null;
        this._headerLongPressEvent = null;
      }, 700);
    },
    onHeaderPointerUp() {
      this.cancelHeaderLongPress();
    },
    onHeaderPointerCancel() {
      this.cancelHeaderLongPress();
    },
    cancelHeaderLongPress() {
      if (this._headerLongPressTimer) {
        clearTimeout(this._headerLongPressTimer);
        this._headerLongPressTimer = null;
        this._headerLongPressEvent = null;
      }
    },
    onRemoveItem(payload) {
      const lbl = (typeof payload === 'string') ? payload : ((payload && (payload.label || payload.title)) ? (payload.label || payload.title) : payload);
      this.$emit('remove-from-widget', { id: this.id, label: lbl });
    },
    firstLetter(label) {
      return String(label || '').trim().charAt(0) || '?';
    },
    onProductIconUpload(payload) {
      this.$emit('icon-upload', payload);
    },
    emitMeasure() {
      if (!this.$refs.root) return;
      const rect = this.$refs.root.getBoundingClientRect();
      this.$emit('measure', {
        id: this.id,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        collapsed: this.collapsed,
      });
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
  transform-origin: top;
}
</style>
