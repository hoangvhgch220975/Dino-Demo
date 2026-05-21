import { createRouter, createWebHistory } from 'vue-router'

import DesktopView from '../ui/views/DesktopView.vue'
import LoginView from '../ui/views/LoginView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'desktop', component: DesktopView },
  { path: '/app/:appKey', name: 'app', component: DesktopView },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

/*
  ========================================================================
  TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (NAVIGATION GUARD AUTHENTICATION)
  ========================================================================
  Khi hệ thống Cloud cũ chuyển đổi, bắt buộc phải đăng nhập mới truy cập được:
  
  router.beforeEach(async (to, from, next) => {
    // 1. Kiểm tra Token (JWT) trong Cookie hoặc LocalStorage:
    const token = localStorage.getItem('auth_token'); // hoặc cookie token
    
    // 2. Nếu truy cập trang yêu cầu đăng nhập (ví dụ: desktop OS) mà chưa có token:
    if (to.name !== 'login' && !token) {
      return next({ name: 'login' });
    }
    
    // 3. (Tùy chọn) Gọi API để xác thực tính hợp lệ của Token trước khi cho phép điều hướng:
    if (token && to.name === 'login') {
      try {
        await verifyTokenAPI(token); // Gọi hàm gọi API BE check token
        return next({ name: 'desktop' }); // Đã đăng nhập -> chuyển thẳng vào Desktop
      } catch (e) {
        localStorage.removeItem('auth_token'); // Token hết hạn -> xóa đi
      }
    }
    
    next();
  });
  ========================================================================
*/

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('mock_authenticated') === 'true';
  
  // Cho phép FE chạy thử nghiệm trơn tru, nếu người dùng muốn trải nghiệm đăng nhập thì chuyển hướng sang /login
  // Để đồng bộ với yêu cầu đăng nhập thực tế của hệ thống cũ nội bộ:
  if (to.name !== 'login' && !isAuthenticated) {
    // Nếu muốn bắt buộc đăng nhập luôn từ đầu, bỏ comment dòng dưới:
    // return next({ name: 'login' });
  }
  
  next();
})

export default router

