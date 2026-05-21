<template>
  <section class="relative">
    <SectionHeader 
      :title="title" 
      :is-open="isOpen" 
      @toggle="isOpen = !isOpen" 
    />

    <transition name="expand">
      <div v-if="isOpen && !isEditMode" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-12 gap-y-12 transition-all duration-500">
        <AppIconTile
          v-for="item in items"
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
    </transition>
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
      isOpen: true,
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

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
