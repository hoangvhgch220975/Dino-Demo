<template>
  <section class="relative">
    <SectionHeader :title="title" />

    <div v-if="!isEditMode" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-8 gap-y-10 transition-all duration-500">
      <AppIconTile
        v-for="item in visibleItems"
        :key="item.label"
        :label="item.label"
        :icon="item.icon"
        :gradient="item.gradient"
        :is-edit-mode="isEditMode"
        :owner="ownerMap[item.key || item.label]"
        :draggable="true"
        @dragstart="onDragStart($event, item)"
        @dragover.prevent
        @drop="onDrop($event, item)"
        @open="$emit('open', $event)"
        @remove="$emit('remove', { label: $event })"
        @enable-edit="$emit('enable-edit')"
      />
    </div>

    <!-- Nút Show More / Show Less -->
    <div v-if="items.length > 16" class="flex justify-center mt-8 pb-2">
      <button
        type="button"
        class="btn-press flex items-center gap-1.5 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/80 hover:text-white text-xs font-bold tracking-widest uppercase backdrop-blur-xl shadow-lg transition-all duration-300"
        @click="isExpanded = !isExpanded"
      >
        <span class="material-symbols-outlined text-[16px] transition-transform duration-300" :class="{ 'rotate-180': isExpanded }">
          keyboard_double_arrow_down
        </span>
        <span>{{ isExpanded ? 'Show Less' : `Show More (+${items.length - 16})` }}</span>
      </button>
    </div>

    <!-- Background overlay để tắt chế độ edit khi nhấn ra ngoài section -->
    <div v-if="isEditMode" class="fixed inset-0 -z-10" @click="$emit('disable-edit')"></div>
  </section>
</template>

<script>
import SectionHeader from './SectionHeader.vue'
import AppIconTile from './AppIconTile.vue'

export default {
  name: 'AppSection',
  components: { SectionHeader, AppIconTile },
  props: {
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
    isEditMode: { type: Boolean, default: false },
    ownerMap: { type: Object, default: () => ({}) },
  },
  emits: ['open', 'remove', 'enable-edit', 'disable-edit', 'reorder'],
  data() {
    return {
      draggedIndex: null,
      isExpanded: false,
    }
  },
  computed: {
    visibleItems() {
      if (this.items.length <= 16 || this.isExpanded) {
        return this.items
      }
      return this.items.slice(0, 16)
    }
  },
  methods: {
    onDragStart(event, item) {
      try {
        event.dataTransfer.setData('application/x-app-key', item.key || (item.label || item.title));
        event.dataTransfer.setData('application/x-app-label', item.label || item.title);
        event.dataTransfer.setData('text/plain', item.label || item.title);
        event.dataTransfer.effectAllowed = 'move';
      } catch (e) { /* ignore */ }
      try { window.__dino_drag_payload = { label: item.label || item.title }; } catch (e) { /* ignore */ }
    },
    onDrop(event, targetItem) {
      const fromLabel = event.dataTransfer.getData('text/plain') || (window.__dino_drag_payload && window.__dino_drag_payload.label);
      if (!fromLabel || fromLabel === targetItem.label) return;
      // Create a new group (folder) when dropping one app onto another
      this.$emit('create-group', { fromLabel, toLabel: targetItem.label, clientX: event.clientX, clientY: event.clientY });
    }
  }
}
</script>
