// Comment code bằng tiếng Việt, code logic bằng tiếng Anh
import { keyFromLabel } from './layout-helpers'

/**
 * Tạo một bản sao làm sạch của cấu hình vị trí biểu tượng (iconPositions).
 * @param {Object} vm - Instance của Vue component.
 * @returns {Object} Bản sao của iconPositions.
 */
export function getCleanedIconPositions(vm) {
  return { ...vm.iconPositions }
}

/**
 * Lưu cấu hình bố cục màn hình hiện tại (vị trí app, widget, hình nền, logo sản phẩm) vào localStorage.
 * @param {Object} vm - Instance của Vue component.
 */
export function saveLayout(vm) {
  try {
    const payload = {
      iconPositions: getCleanedIconPositions(vm),
      widgetPositions: vm.widgetPositions,
      widgets: vm.widgets,
      desktopApps: vm.desktopApps,
      productIconUrls: vm.productIconUrls,
    }
    localStorage.setItem('desktop_layout', JSON.stringify(payload))
  } catch (e) {
    // Bỏ qua lỗi ghi ghi đè nếu đầy bộ nhớ
  }
}

/**
 * Tải cấu hình bố cục màn hình cá nhân hóa từ localStorage và chuẩn hóa tương thích ngược.
 * @param {Object} vm - Instance của Vue component.
 */
export function loadLayout(vm) {
  try {
    const raw = localStorage.getItem('desktop_layout')
    if (!raw) return
    const parsed = JSON.parse(raw)
    
    if (parsed.iconPositions) {
      vm.iconPositions = parsed.iconPositions
    }
    if (parsed.widgetPositions) {
      vm.widgetPositions = parsed.widgetPositions
    }
    if (parsed.widgets) {
      // Đảm bảo tương thích ngược: chuyển đổi các mảng items cũ của Widget nhóm thành appIds
      vm.widgets = parsed.widgets.map(w => {
        const base = { collapsed: false, z: w.z || 0, ...w }
        if (Array.isArray(base.items) && base.items.length && (base.items[0] && (base.items[0].label || base.items[0].key))) {
          base.appIds = base.items.map(it => (it.key ? it.key : keyFromLabel(it.label || it)))
          delete base.items
        }
        if (!Array.isArray(base.appIds)) base.appIds = []
        return base
      })
    }
    if (parsed.desktopApps && Array.isArray(parsed.desktopApps)) {
      vm.desktopApps = parsed.desktopApps
    }
    if (parsed.productIconUrls && typeof parsed.productIconUrls === 'object') {
      vm.productIconUrls = parsed.productIconUrls
    }

    // Làm sạch dữ liệu bố cục: loại bỏ các app đã được cho vào trong Widget nhóm ra khỏi desktop
    const inGroups = new Set()
    vm.widgets.forEach(w => {
      if (Array.isArray(w.appIds)) {
        w.appIds.forEach(a => {
          if (a !== null && a !== undefined) inGroups.add(String(a))
        })
      }
    })

    if (vm.desktopApps && Array.isArray(vm.desktopApps)) {
      const seen = new Set()
      vm.desktopApps = vm.desktopApps
        .filter(d => d && d.appId && !inGroups.has(String(d.appId)))
        .filter(d => {
          const key = String(d.appId)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map(d => ({
          appId: String(d.appId),
          position: vm.getPagedPosition(d.position || { x: 40, y: 80 }, vm.getPositionPage(d.position)),
          displayMode: d.displayMode || 'icon'
        }))
    }

    // Khử trùng lặp và chuyển đổi kiểu dữ liệu appIds trong Widgets nhóm
    vm.widgets.forEach(w => {
      if (Array.isArray(w.appIds)) {
        w.appIds = Array.from(new Set(w.appIds.map(a => (a === null || a === undefined) ? null : String(a)).filter(Boolean)))
      } else {
        w.appIds = []
      }
    })

    // Xử lý các items kế thừa cũ nếu có và trộn vào appIds
    vm.widgets.forEach(w => {
      if (Array.isArray(w.items)) {
        const converted = w.items.map(it => {
          if (!it) return null
          if (typeof it === 'string') return keyFromLabel(it)
          if (it.key) return String(it.key)
          if (it.label) return keyFromLabel(it.label)
          return null
        }).filter(Boolean)
        w.appIds = Array.from(new Set([...(w.appIds || []), ...converted]))
        delete w.items
      }
    })
  } catch (e) {
    // Bỏ qua nếu dữ liệu JSON lưu trữ bị hỏng
  }
}

/**
 * Lưu trạng thái các cửa sổ đang hoạt động/kích thước/vị trí vào localStorage để khôi phục phiên làm việc sau khi tải lại.
 * @param {Object} vm - Instance của Vue component.
 */
export function saveOpenWindows(vm) {
  try {
    const list = vm.openWindows.map(w => ({
      key: w.key,
      rect: w.rect,
      z: w.z,
      minimized: w.minimized,
      maximized: w.maximized,
    }))
    localStorage.setItem('desktop_open_windows', JSON.stringify(list))
  } catch (e) {
    // Bỏ qua lỗi
  }
}
