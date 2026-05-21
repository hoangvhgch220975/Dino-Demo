<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
    <!-- Nền Wallpaper đồng bộ với hệ thống -->
    <WallpaperBackground />

    <!-- Card đăng nhập Glassmorphism cao cấp -->
    <div 
      class="w-[min(440px,calc(100vw-32px))] rounded-3xl border border-white/12 bg-white/[0.04] p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl noise-overlay transition-all duration-500 hover:border-white/20 hover:shadow-[0_24px_100px_rgba(0,0,0,0.6)]"
    >
      <!-- Logo & Tiêu đề -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-1 ring-white/20 mb-4 animate-pulse">
          <span class="material-symbols-outlined text-white text-[36px]">cloud_sync</span>
        </div>
        <h1 class="text-white text-2xl font-extrabold tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">Dino Cloud System</h1>
        <p class="text-white/50 text-[13px] font-medium tracking-wide mt-1.5 uppercase">Hệ thống Đám mây Nội bộ</p>
      </div>

      <!-- Form Đăng nhập -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        <!-- Input Tài khoản -->
        <div class="flex flex-col gap-2">
          <label for="username" class="text-white/60 text-[11px] font-bold uppercase tracking-wider pl-1">Tài khoản</label>
          <div class="relative flex items-center">
            <span class="material-symbols-outlined absolute left-4 text-white/40 text-[18px]">person</span>
            <input 
              id="username"
              v-model="username" 
              type="text" 
              placeholder="Nhập tên đăng nhập hoặc email"
              required
              class="w-full h-12 pl-11 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-400/50 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Input Mật khẩu -->
        <div class="flex flex-col gap-2">
          <label for="password" class="text-white/60 text-[11px] font-bold uppercase tracking-wider pl-1">Mật khẩu</label>
          <div class="relative flex items-center">
            <span class="material-symbols-outlined absolute left-4 text-white/40 text-[18px]">lock</span>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              placeholder="Nhập mật khẩu truy cập"
              required
              class="w-full h-12 pl-11 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-400/50 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Trạng thái lỗi giả định -->
        <div v-if="errorMessage" class="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl">
          <span class="material-symbols-outlined text-[16px]">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Nút Đăng nhập -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-[14px] shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span v-if="isLoading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-1"></span>
          <span>{{ isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống' }}</span>
        </button>
      </form>

      <!-- Footer Info -->
      <div class="mt-8 text-center text-[11px] text-white/30 font-medium">
        &copy; 2026 Dino Cloud Internal Suite. Bảo mật tuyệt đối.
      </div>
    </div>
  </div>
</template>

<script>
import WallpaperBackground from '../components/WallpaperBackground.vue'

export default {
  name: 'LoginView',
  components: {
    WallpaperBackground,
  },
  data() {
    return {
      username: '',
      password: '',
      isLoading: false,
      errorMessage: '',
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = '';

      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (INTEGRATION PLACEHOLDER)
        ========================================================================
        Khi liên kết với Backend của hệ thống Cloud cũ nội bộ, bạn cần thực hiện:

        1. Gửi request POST tới endpoint API đăng nhập:
           const response = await fetch('https://api.dinocloud.internal/v1/auth/login', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ username: this.username, password: this.password })
           });

        2. Xử lý phản hồi từ BE:
           const data = await response.json();
           if (!response.ok) {
             throw new Error(data.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.');
           }

        3. Lưu trữ Session/Token cá nhân hóa:
           - Lưu JWT Token vào Cookie bảo mật (HttpOnly) hoặc LocalStorage/SessionStorage:
             localStorage.setItem('auth_token', data.token);
           - Thiết lập headers Authorization mặc định cho các cuộc gọi API tiếp theo.

        4. Fetch thông tin cấu hình người dùng cá nhân hóa từ DB (Personalization Config):
           - Gọi API lấy layout, hình nền, danh sách ứng dụng đã bật của tài khoản này:
             const userConfig = await fetch('https://api.dinocloud.internal/v1/user/config', {
               headers: { 'Authorization': `Bearer ${data.token}` }
             }).then(res => res.json());
           - Lưu vào store quản lý trạng thái (ví dụ: Pinia) hoặc LocalStorage để DesktopView load lên.

        5. Điều hướng người dùng vào trang Desktop OS chính:
           this.$router.push('/');
        ========================================================================
      */

      // Logic mock tạm thời để FE chạy trực quan trơn tru:
      setTimeout(() => {
        this.isLoading = false;
        if (this.username && this.password) {
          // Lưu token giả lập để bypass navigation guard
          localStorage.setItem('mock_authenticated', 'true');
          localStorage.setItem('mock_user_name', this.username);
          this.$router.push('/');
        } else {
          this.errorMessage = 'Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu!';
        }
      }, 1200);
    }
  }
}
</script>

<style scoped>
/* Hiệu ứng mờ hạt mịn overlay */
.noise-overlay {
  position: relative;
}
.noise-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.022;
  border-radius: inherit;
  pointer-events: none;
}
</style>
