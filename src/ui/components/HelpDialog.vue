<template>
  <transition name="fade">
    <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md" @click.self="$emit('close')">
      <div class="glass-panel glass-panel--strong noise-overlay rounded-[24px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl w-[min(680px,95vw)] p-6 md:p-8 text-white relative flex flex-col gap-6 select-none overflow-hidden max-h-[90vh] animate-zoom-in">
        
        <!-- Background Neon Glow Decors -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-[64px] pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-[64px] pointer-events-none"></div>

        <!-- Close Button Top Right -->
        <button 
          type="button" 
          class="absolute top-5 right-5 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center z-10" 
          aria-label="Close" 
          @click="$emit('close')"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <!-- Header -->
        <div class="flex flex-col items-center text-center gap-2 mt-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <span class="material-symbols-outlined text-white text-[26px]">help_outline</span>
          </div>
          <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white/95 mt-2">
            Tài nguyên trợ giúp & Pháp lý
          </h2>
          <p class="text-xs md:text-sm text-white/55 font-light max-w-md">
            Nextcloud help & privacy resources — Kết nối trực tiếp tới các cổng thông tin, hướng dẫn sử dụng và điều khoản dịch vụ chính thức.
          </p>
        </div>

        <!-- Resources Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 w-full max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
          <component
            :is="res.isPlaceholder ? 'button' : 'a'"
            v-for="(res, idx) in resources"
            :key="idx"
            :href="res.isPlaceholder ? undefined : res.url"
            :target="res.isPlaceholder ? undefined : '_blank'"
            :rel="res.isPlaceholder ? undefined : 'noopener noreferrer'"
            class="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] text-left w-full"
            :class="{ 'sm:col-span-2': idx === 4 }"
            @click="res.isPlaceholder ? handlePlaceholderClick(res) : undefined"
          >
            <!-- Icon Frame with Glow -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 bg-gradient-to-br relative group-hover:scale-105 transition-transform duration-300" :class="res.gradient">
              <span class="material-symbols-outlined text-white text-[20px]">{{ res.icon }}</span>
              <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-sm bg-gradient-to-br" :class="res.gradient"></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="text-[13.5px] font-semibold text-white/90 group-hover:text-white flex items-center justify-between gap-1.5">
                <span class="truncate">{{ res.title }}</span>
                <span v-if="res.isPlaceholder" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white/80 transition-colors shrink-0">Nội bộ</span>
                <span v-else class="material-symbols-outlined text-[13px] text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0">open_in_new</span>
              </div>
              <div class="text-[11.5px] text-white/45 group-hover:text-white/65 font-light truncate mt-0.5">
                {{ res.subtitle }}
              </div>
            </div>
          </component>
        </div>

        <!-- Footer -->
        <div class="flex justify-center border-t border-white/5 pt-4 mt-1">
          <button 
            type="button" 
            class="px-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.09] hover:border-white/20 transition-all font-medium text-sm text-white/85 active:scale-[0.98] cursor-pointer"
            @click="$emit('close')"
          >
            Đóng hộp thoại
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'HelpDialog',
  emits: ['close'],
  data() {
    return {
      resources: [
        { 
          title: 'Tài liệu tài khoản', 
          subtitle: 'Account documentation', 
          icon: 'manage_accounts', 
          gradient: 'from-blue-500/80 to-indigo-600/80', 
          isPlaceholder: true,
          url: '#' 
          /*
            ========================================================================
            TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (ĐƯỜNG DẪN TÀI LIỆU TÀI KHOẢN NỘI BỘ CỦA CÔNG TY)
            ========================================================================
            Khi tích hợp Backend, nếu công ty có link wiki, docs hoặc portal riêng cho hướng dẫn tài khoản:
            1. Thay đổi thuộc tính `url` thành link thực tế.
            2. Xóa `isPlaceholder: true` để thẻ tự động hoạt động dưới dạng thẻ liên kết <a>.
            ========================================================================
          */
        },
        { 
          title: 'Tài liệu quản trị', 
          subtitle: 'Administration documentation', 
          icon: 'admin_panel_settings', 
          gradient: 'from-amber-500/80 to-orange-600/80', 
          isPlaceholder: true,
          url: '#' 
          /*
            ========================================================================
            TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (ĐƯỜNG DẪN TÀI LIỆU QUẢN TRỊ NỘI BỘ CỦA CÔNG TY)
            ========================================================================
            Khi tích hợp Backend, nếu công ty có tài liệu hướng dẫn vận hành cho Admin:
            1. Thay đổi thuộc tính `url` thành link thực tế.
            2. Xóa `isPlaceholder: true` để thẻ tự động hoạt động dưới dạng thẻ liên kết <a>.
            ========================================================================
          */
        },
        { 
          title: 'Tài liệu chung', 
          subtitle: 'General documentation', 
          icon: 'description', 
          gradient: 'from-emerald-500/80 to-teal-600/80', 
          url: 'https://docs.nextcloud.com/' 
        },
        { 
          title: 'Diễn đàn hỗ trợ', 
          subtitle: 'Forum', 
          icon: 'forum', 
          gradient: 'from-purple-500/80 to-pink-600/80', 
          url: 'https://help.nextcloud.com/' 
        },
        { 
          title: 'Thông tin pháp lý', 
          subtitle: 'Legal notice', 
          icon: 'gavel', 
          gradient: 'from-rose-500/80 to-red-600/80', 
          url: 'https://vsg.top/' 
        }
      ]
    }
  },
  methods: {
    handlePlaceholderClick(res) {
      alert(`Tài liệu "${res.title}" (${res.subtitle}) thuộc hệ thống nội bộ của công ty và hiện đang được xây dựng.\n\nSau khi tích hợp Backend hoàn thiện, liên kết tài liệu thực tế của công ty sẽ được kết nối tại đây! 🚀`);
    }
  }
}
</script>

<style scoped>
@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-zoom-in {
  animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom fade transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom thin scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.18);
}
</style>
