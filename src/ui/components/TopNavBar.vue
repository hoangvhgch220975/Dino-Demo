<template>
  <header class="fixed top-0 w-full h-[64px] glass-panel glass-panel--strong noise-overlay flex justify-between items-center px-6 z-50">
    <div class="flex items-center gap-3">
      <img
        alt="Dino Cloud Logo"
        class="h-8 w-8 object-contain rounded-sm"
        :src="logoUrl"
      />
      <span class="text-white font-bold text-sm tracking-tight">Dino Cloud</span>
    </div>

    <div class="flex items-center gap-1 relative">
      <div v-for="btn in visibleButtons" :key="btn.icon || btn.text" class="relative group">
        <button
          class="btn-press p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
          type="button"
          :aria-label="btn.label"
          @click="handleClick(btn)"
        >
          <span v-if="btn.icon" class="material-symbols-outlined" :class="btn.sizeClass + ' text-on-surface-variant'">{{ btn.icon }}</span>
          <span v-else class="text-on-surface-variant font-bold text-[13px] px-1">{{ btn.text }}</span>
        </button>

        <!-- Profile Dropdown -->
        <div 
          v-if="btn.icon === 'account_circle' && isProfileMenuOpen" 
          class="absolute right-0 mt-3 z-[60]"
        >
          <!-- Triangle Caret -->
          <div class="absolute -top-[5px] right-[14px] w-[12px] h-[12px] bg-[#1a1a1c] border-t border-l border-white/10 transform rotate-45 z-0 rounded-sm"></div>
          
          <!-- Dropdown Content -->
          <div class="w-36 bg-[#1a1a1c] border border-white/10 rounded-[14px] shadow-2xl relative z-10 flex flex-col gap-0.5 p-1.5">
            <button 
              class="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white text-[13px] font-medium hover:bg-white/5 rounded-[10px] transition-colors text-left"
              @click="showComingSoon"
            >
              <span class="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </button>
            <button 
              class="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white text-[13px] font-medium hover:bg-white/5 rounded-[10px] transition-colors text-left"
              @click="handleLogout"
            >
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>

        <!-- More Apps Dropdown -->
        <div 
          v-if="btn.icon === 'more_horiz' && isMoreMenuOpen" 
          class="absolute right-0 mt-3 z-[60]"
        >
          <!-- Triangle Caret -->
          <div class="absolute -top-[5px] right-[14px] w-[12px] h-[12px] bg-[#1a1a1c] border-t border-l border-white/10 transform rotate-45 z-0 rounded-sm"></div>
          
          <!-- Dropdown Content -->
          <div class="w-56 bg-[#1a1a1c] border border-white/10 rounded-[16px] shadow-2xl relative z-10 flex flex-col p-2 gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div v-if="(!moreAppsGrouped && moreApps.length === 0) || (moreAppsGrouped && Object.keys(moreAppsGrouped).length === 0)" class="px-3 py-4 text-white/40 text-sm text-center">
              All apps are visible on main UI
            </div>

            <template v-if="moreAppsGrouped">
              <div v-for="(items, section) in moreAppsGrouped" :key="section" class="pb-2">
                <div class="px-3 pt-2 pb-1 text-white/60 text-xs font-semibold">{{ section }}</div>
                <div class="flex flex-col gap-1 px-1">
                  <button
                    v-for="app in items"
                    :key="app.key || app.label"
                    class="flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white text-[13px] font-medium hover:bg-white/5 rounded-xl transition-colors text-left shrink-0 cursor-grab active:cursor-grabbing"
                    draggable="true"
                    @dragstart="handleDragStart($event, app.key || keyFromLabel(app.label))"
                    @click="handleAppClick(app.key || keyFromLabel(app.label))"
                  >
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 bg-gradient-to-br" :class="app.gradient">
                      <span class="material-symbols-outlined text-white text-[18px]">{{ app.icon }}</span>
                    </div>
                    <span class="truncate">{{ app.title || app.label }}</span>
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <button 
                v-for="app in moreApps"
                :key="app.key || app.label"
                class="flex items-center gap-3 px-3 py-2 text-white/90 hover:text-white text-[13px] font-medium hover:bg-white/5 rounded-xl transition-colors text-left shrink-0 cursor-grab active:cursor-grabbing"
                draggable="true"
                @dragstart="handleDragStart($event, app.key || keyFromLabel(app.label))"
                @click="handleAppClick(app.key || keyFromLabel(app.label))"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 bg-gradient-to-br" :class="app.gradient">
                  <span class="material-symbols-outlined text-white text-[18px]">{{ app.icon }}</span>
                </div>
                <span class="truncate">{{ app.title || app.label }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Full screen overlay to close menus -->
  <div 
    v-if="isProfileMenuOpen || isMoreMenuOpen" 
    class="fixed inset-0 z-[45]"
    @click="closeAllMenus"
  ></div>
</template>

<script>
import dinoLogo from '../../assets/dino_logo.png'

export default {
  name: 'TopNavBar',
  props: {
    logoUrl: {
      type: String,
      default: dinoLogo.default || dinoLogo,
    },
    hasMore: {
      type: Boolean,
      default: false,
    },
    moreApps: {
      type: Array,
      default: () => [],
    },
    moreAppsGrouped: {
      type: Object,
      default: null,
    },
  },
  emits: ['open-app', 'open-help'],
  data() {
    const baseButtons = [
      { icon: 'language', label: 'Language', sizeClass: 'text-[20px]' },
      { icon: 'accessibility_new', label: 'Accessibility', sizeClass: 'text-[20px]' },
      { icon: 'help_outline', label: 'Help', sizeClass: 'text-[20px]' },
      { icon: 'account_circle', label: 'Account', sizeClass: 'text-[24px]' },
    ]
    return {
      isProfileMenuOpen: false,
      isMoreMenuOpen: false,
      baseButtons,
    }
  },
  computed: {
    visibleButtons() {
      const buttons = [...this.baseButtons]
      if (this.hasMore) {
        buttons.push({ icon: 'more_horiz', label: 'More', sizeClass: 'text-[20px]' })
      }
      return buttons
    }
  },
  methods: {
    keyFromLabel(label) {
      return label.replace(/\s+/g, '').toLowerCase()
    },
    handleClick(btn) {
      if (btn.icon === 'account_circle') {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
        this.isMoreMenuOpen = false;
      } else if (btn.icon === 'more_horiz') {
        this.isMoreMenuOpen = !this.isMoreMenuOpen;
        this.isProfileMenuOpen = false;
      } else if (btn.icon === 'help_outline') {
        this.$emit('open-help');
      } else {
        this.showComingSoon();
      }
    },
    handleDragStart(event, appKey) {
      // Gán appKey vào drag event data để nhận diện khi thả / Set appKey to drag event data for dropping
      // Also set fallback formats (label / text) so both overlay and main drop handlers accept it.
      try {
        event.dataTransfer.setData('application/x-app-key', appKey);
        event.dataTransfer.setData('application/x-app-label', appKey);
        event.dataTransfer.setData('text/plain', appKey);
        event.dataTransfer.effectAllowed = 'move';
      } catch (e) { void e; }
      // Also set a global fallback payload (useful when DataTransfer is unavailable)
      try { window.__dino_drag_payload = { label: appKey }; } catch (e) { void e; }
      
      // Ẩn dropdown đi để dễ dàng kéo thả ra Main UI / Hide dropdown to make it easier to drag to Main UI
      setTimeout(() => {
        this.closeAllMenus();
      }, 0);
    },
    handleAppClick(appKey) {
      this.$emit('open-app', appKey);
      this.closeAllMenus();
    },
    closeAllMenus() {
      this.isProfileMenuOpen = false;
      this.isMoreMenuOpen = false;
    },
    handleLogout() {
      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (ĐĂNG XUẤT HỆ THỐNG)
        ========================================================================
        Khi người dùng nhấn đăng xuất:
        
        1. Gửi yêu cầu đăng xuất tới API BE để hủy token session trên máy chủ:
           await fetch('https://api.dinocloud.internal/v1/auth/logout', {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           
        2. Xóa các Token và thông tin lưu trữ cá nhân hóa cục bộ:
           localStorage.removeItem('auth_token');
           localStorage.removeItem('user_profile');
           
        3. Chuyển hướng người dùng về trang Đăng nhập (/login):
           this.$router.push('/login');
        ========================================================================
      */
      localStorage.removeItem('mock_authenticated');
      localStorage.removeItem('mock_user_name');
      this.closeAllMenus();
      this.$router.push('/login');
    },
    showComingSoon() {
      alert('Feature coming soon! ❤️');
      this.closeAllMenus();
    }
  }
}
</script>
