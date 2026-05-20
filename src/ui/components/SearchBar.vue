<template>
  <div class="flex justify-center w-full mt-6 mb-6">
    <div class="glass-panel noise-overlay flex items-center gap-4 px-5 h-13 w-full max-w-[520px] rounded-full">
      <span class="material-symbols-outlined text-[22px] text-on-surface-variant/60">search</span>
      <input
        class="bg-transparent border-none focus:ring-0 text-[15px] text-on-surface-variant placeholder:text-on-surface-variant/40 w-full"
        :placeholder="placeholder"
        type="text"
        v-model="model"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Search apps, files, and settings...',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    model: {
      get() {
        return this.modelValue
      },
      set(v) {
        this.$emit('update:modelValue', v)
      },
    },
  },
}
</script>
