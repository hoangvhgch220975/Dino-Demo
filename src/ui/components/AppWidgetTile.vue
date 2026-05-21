<template>
  <div
    class="absolute pointer-events-auto select-none rounded-[24px] bg-white/95 text-slate-800 border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl p-4 flex flex-col gap-3 w-[240px] h-[288px] group/widget"
    :class="{ 'transition-all duration-300': !isDragging, 'jiggle cursor-move ring-2 ring-sky-400/50': isEditMode && !isDragging, 'cursor-grab active:cursor-grabbing hover:shadow-[0_20px_56px_rgba(0,0,0,0.22)]': !isEditMode, 'ring-4 ring-sky-400 scale-[1.02] shadow-2xl': isSelected || isDragging }"
    :style="positionStyle"
    :data-widget-id="appId"
    :data-label="label"
    @mousedown="startLongPress"
    @mouseup="cancelLongPress"
    @mouseleave="cancelLongPress"
    @touchstart="startLongPress"
    @touchend="cancelLongPress"
    @pointerdown="onPointerDown"
    @click="handleClick"
  >
    <!-- Toggle mode và nút xóa trong Edit Mode -->
    <div v-if="isEditMode" class="absolute top-2 right-2 flex gap-1 z-30">
      <button
        class="w-6 h-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center border border-white/20 shadow-md transition-colors"
        title="Đổi thành Icon App"
        @click.stop="$emit('toggle-mode', appId)"
      >
        <span class="material-symbols-outlined text-[14px]">grid_view</span>
      </button>
      <button
        class="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center border border-white/20 shadow-md transition-colors"
        title="Xóa ứng dụng"
        @click.stop="$emit('remove', appId)"
      >
        <span class="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>

    <!-- Header Widget -->
    <div class="flex items-center gap-2.5 border-b border-slate-100 pb-2">
      <div :class="['w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm text-white shrink-0', gradient]">
        <span class="material-symbols-outlined text-[16px]">{{ icon }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-[13px] font-bold text-slate-900 truncate leading-tight">{{ widgetData.header }}</h3>
      </div>
    </div>

    <!-- Items List (Chỉ hiện 5 thông tin) -->
    <div class="flex-1 flex flex-col gap-1.5 overflow-hidden">
      <div
        v-for="item in widgetData.items"
        :key="item.id"
        class="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-150 hover:bg-slate-500/5 group/item cursor-pointer"
        :class="{ 'bg-slate-500/5': item.id === 1 }"
      >
        <!-- Icon / Avatar -->
        <div
          v-if="item.isMaterialIcon"
          :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-[13px]', item.bg]"
        >
          <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
        </div>
        <div
          v-else
          :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold text-[11px] uppercase tracking-wider', item.bg]"
        >
          {{ item.avatar }}
        </div>

        <!-- Info content -->
        <div class="min-w-0 flex-1 flex flex-col">
          <span class="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover/item:text-slate-950">{{ item.name }}</span>
          <span class="text-[9.5px] text-slate-500 truncate mt-0.5 leading-snug">{{ item.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const MOCK_DATA = {
  talk: {
    header: "Talk mentions",
    icon: "chat",
    gradient: "from-blue-500 to-blue-600",
    items: [
      { id: 1, avatar: "DC", name: "DINO Cloud", desc: "You were mentioned in general", bg: "bg-blue-500/10 text-blue-600" },
      { id: 2, avatar: "TN", name: "Trần Ngọc Dưỡng (OS)", desc: "B nhúng home vào local ch", bg: "bg-pink-500/10 text-pink-600" },
      { id: 3, avatar: "AT", name: "Anh Thư (HR)", desc: "Gửi em hồ sơ ứng viên mới", bg: "bg-purple-500/10 text-purple-600" },
      { id: 4, avatar: "DT", name: "Dev Team", desc: "Release version 1.2.0 successful", bg: "bg-emerald-500/10 text-emerald-600" },
      { id: 5, avatar: "QP", name: "Quốc Phong", desc: "Chiều nay họp lúc 3h nhé", bg: "bg-amber-500/10 text-amber-600" }
    ]
  },
  mail: {
    header: "Mail inbox",
    icon: "mail",
    gradient: "from-red-500 to-red-600",
    items: [
      { id: 1, avatar: "GC", name: "Google Cloud", desc: "Billing Statement for May 2026", bg: "bg-blue-500/10 text-blue-600" },
      { id: 2, avatar: "GH", name: "GitHub", desc: "[Security] Alert for repo Dino-Demo", bg: "bg-slate-900/10 text-slate-800" },
      { id: 3, avatar: "HR", name: "HR Dino", desc: "Thông báo Company Trip hè 2026", bg: "bg-red-500/10 text-red-600" },
      { id: 4, avatar: "DS", name: "Dino Support", desc: "Feedback regarding your dashboard", bg: "bg-emerald-500/10 text-emerald-600" },
      { id: 5, avatar: "NW", name: "Tech Weekly", desc: "Dino OS Architecture Review inside", bg: "bg-purple-500/10 text-purple-600" }
    ]
  },
  files: {
    header: "Favorite files",
    icon: "folder",
    gradient: "from-amber-500 to-amber-600",
    items: [
      { id: 1, icon: "picture_as_pdf", name: "Dino_Cloud_Deck.pdf", desc: "14 MB • PDF Document", bg: "bg-red-500/10 text-red-600", isMaterialIcon: true },
      { id: 2, icon: "table_chart", name: "Q2_Report.xlsx", desc: "2.4 MB • Excel Sheet", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true },
      { id: 3, icon: "image", name: "Logo_Dino_Cloud.png", desc: "512 KB • PNG Image", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 4, icon: "description", name: "Resume_HoangV.docx", desc: "120 KB • Word Document", bg: "bg-indigo-500/10 text-indigo-600", isMaterialIcon: true },
      { id: 5, icon: "article", name: "Project_Specs.md", desc: "15 KB • Markdown File", bg: "bg-slate-500/10 text-slate-600", isMaterialIcon: true }
    ]
  },
  file: {
    header: "Favorite files",
    icon: "folder",
    gradient: "from-amber-500 to-amber-600",
    items: [
      { id: 1, icon: "picture_as_pdf", name: "Dino_Cloud_Deck.pdf", desc: "14 MB • PDF Document", bg: "bg-red-500/10 text-red-600", isMaterialIcon: true },
      { id: 2, icon: "table_chart", name: "Q2_Report.xlsx", desc: "2.4 MB • Excel Sheet", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true },
      { id: 3, icon: "image", name: "Logo_Dino_Cloud.png", desc: "512 KB • PNG Image", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 4, icon: "description", name: "Resume_HoangV.docx", desc: "120 KB • Word Document", bg: "bg-indigo-500/10 text-indigo-600", isMaterialIcon: true },
      { id: 5, icon: "article", name: "Project_Specs.md", desc: "15 KB • Markdown File", bg: "bg-slate-500/10 text-slate-600", isMaterialIcon: true }
    ]
  },
  activity: {
    header: "Recent activities",
    icon: "analytics",
    gradient: "from-emerald-500 to-emerald-600",
    items: [
      { id: 1, icon: "edit", name: "Updated SideDock.vue", desc: "Modified styles & gap layout", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 2, icon: "rocket_launch", name: "Deployed dino-cloud-fe", desc: "Staging build succeeded", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true },
      { id: 3, icon: "commit", name: "Committed master branch", desc: "Added dynamic dock boundaries", bg: "bg-purple-500/10 text-purple-600", isMaterialIcon: true },
      { id: 4, icon: "cleaning_services", name: "Cleaned cache", desc: "npm run cache-clean done", bg: "bg-amber-500/10 text-amber-600", isMaterialIcon: true },
      { id: 5, icon: "merge", name: "Merged Pull Request #42", desc: "Cascading Group Deletion", bg: "bg-indigo-500/10 text-indigo-600", isMaterialIcon: true }
    ]
  },
  announcement: {
    header: "Recent announcements",
    icon: "campaign",
    gradient: "from-orange-500 to-orange-600",
    items: [
      { id: 1, icon: "warning", name: "Maintenance Alert", desc: "System upgrade tonight at 12:00 PM", bg: "bg-rose-500/10 text-rose-600", isMaterialIcon: true },
      { id: 2, icon: "stars", name: "New Feature Release", desc: "Dynamic desktop widgets are live!", bg: "bg-amber-500/10 text-amber-600", isMaterialIcon: true },
      { id: 3, icon: "event", name: "HR Announcement", desc: "Holiday schedule for next month", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 4, icon: "shield", name: "Security Update", desc: "Please reset your Dino Cloud passwords", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true },
      { id: 5, icon: "description", name: "Policy Update", desc: "New working hours guidelines", bg: "bg-purple-500/10 text-purple-600", isMaterialIcon: true }
    ]
  },
  notes: {
    header: "Recent notes",
    icon: "edit_note",
    gradient: "from-yellow-500 to-yellow-600",
    items: [
      { id: 1, icon: "lightbulb", name: "Ideas for Dino Cloud", desc: "Responsive widgets, backend link", bg: "bg-amber-500/10 text-amber-600", isMaterialIcon: true },
      { id: 2, icon: "shopping_basket", name: "Grocery List", desc: "Buy milk, butter, apples, coffee", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 3, icon: "groups", name: "Standup Notes", desc: "Discuss coordinates with backend", bg: "bg-purple-500/10 text-purple-600", isMaterialIcon: true },
      { id: 4, icon: "gavel", name: "Git Commit Rules", desc: "Run lint and build before commit", bg: "bg-rose-500/10 text-rose-600", isMaterialIcon: true },
      { id: 5, icon: "flag", name: "Personal Goals", desc: "Complete Next.js implementation", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true }
    ]
  },
  note: {
    header: "Recent notes",
    icon: "edit_note",
    gradient: "from-yellow-500 to-yellow-600",
    items: [
      { id: 1, icon: "lightbulb", name: "Ideas for Dino Cloud", desc: "Responsive widgets, backend link", bg: "bg-amber-500/10 text-amber-600", isMaterialIcon: true },
      { id: 2, icon: "shopping_basket", name: "Grocery List", desc: "Buy milk, butter, apples, coffee", bg: "bg-blue-500/10 text-blue-600", isMaterialIcon: true },
      { id: 3, icon: "groups", name: "Standup Notes", desc: "Discuss coordinates with backend", bg: "bg-purple-500/10 text-purple-600", isMaterialIcon: true },
      { id: 4, icon: "gavel", name: "Git Commit Rules", desc: "Run lint and build before commit", bg: "bg-rose-500/10 text-rose-600", isMaterialIcon: true },
      { id: 5, icon: "flag", name: "Personal Goals", desc: "Complete Next.js implementation", bg: "bg-emerald-500/10 text-emerald-600", isMaterialIcon: true }
    ]
  }
};

export default {
  name: 'AppWidgetTile',
  props: {
    appId: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    gradient: { type: String, default: 'from-slate-600 to-slate-800' },
    isEditMode: { type: Boolean, default: false },
    position: { type: Object, default: null },
    isSelected: { type: Boolean, default: false },
    isDragging: { type: Boolean, default: false }
  },
  emits: ['toggle-mode', 'remove', 'pointerdown', 'open', 'enable-edit'],
  data() {
    return {
      longPressTimer: null,
    };
  },
  computed: {
    positionStyle() {
      if (this.position && typeof this.position.x === 'number') {
        const style = {
          position: 'absolute',
          left: `${this.position.x}px`,
          zIndex: this.isEditMode ? 50 : 20,
        };
        if (typeof this.position.y === 'number') {
          style.top = `${this.position.y}px`;
        } else if (typeof this.position.bottom === 'number') {
          style.bottom = `${this.position.bottom}px`;
        }
        return style;
      }
      return {};
    },
    widgetData() {
      const key = this.appId.toLowerCase();
      if (MOCK_DATA[key]) {
        return MOCK_DATA[key];
      }
      // default fallback
      return {
        header: this.label,
        icon: this.icon,
        gradient: this.gradient,
        items: [
          { id: 1, avatar: "?", name: "No Data", desc: "Widget display mode fallback", bg: "bg-slate-500/10 text-slate-600" }
        ]
      };
    }
  },
  methods: {
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
    onPointerDown(e) {
      if (!this.isEditMode) return;
      if (e.target.closest('button')) return;
      this.$emit('pointerdown', e);
    },
    handleClick() {
      if (this.isEditMode) return;
      this.$emit('open', this.label);
    }
  }
}
</script>

<style scoped>
@keyframes jiggle {
  0% { transform: rotate(-0.5deg); }
  50% { transform: rotate(0.5deg); }
  100% { transform: rotate(-0.5deg); }
}
.jiggle {
  animation: jiggle 0.28s ease-in-out infinite;
}
</style>
