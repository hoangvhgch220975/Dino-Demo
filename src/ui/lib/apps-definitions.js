import { appsRegistry } from './apps-registry'

/*
  ========================================================================
  TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (PHÂN PHÂN BỔ APP/PRODUCT THEO ROLE TỪ BE)
  ========================================================================
  Thay vì chia phần Apps và Products cứng ở đây:
  Sau này khi kết nối BE, cấu trúc phân quyền (Role-based access) của user đăng nhập
  sẽ quyết định User được thấy những App và Product nào. Dữ liệu này sẽ được fetch từ BE
  và map động vào hai danh sách để hiển thị trên Desktop hoặc Menu More.
  ========================================================================
*/

export const appSections = [
  {
    title: 'Apps',
    items: [
      appsRegistry.talk,
      appsRegistry.files,
      appsRegistry.activity,
      appsRegistry.mail,
      appsRegistry.contact,
      appsRegistry.calendar,
      appsRegistry.teamhub,
      appsRegistry.social,
      appsRegistry.announcement,
      appsRegistry.notes,
      appsRegistry.countdown,
      appsRegistry.photos,
      appsRegistry.music,
      appsRegistry.weather,
      appsRegistry.maps,
      appsRegistry.news,
      appsRegistry.settings,
      appsRegistry.terminal,
      appsRegistry.tasks,
      appsRegistry.camera,
      appsRegistry.calculator,
    ],
  },
  {
    title: 'Product',
    items: [
      appsRegistry.website,
      appsRegistry.dino,
      appsRegistry.ec,
      appsRegistry.pvcfc,
      appsRegistry.admin,
      appsRegistry.dinoEdu,
      appsRegistry.dinoPay,
      appsRegistry.dinoShop,
      appsRegistry.dinoHealth,
      appsRegistry.dinoDrive,
    ],
  },
]
