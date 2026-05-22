// Comment code bằng tiếng Việt, code logic bằng tiếng Anh
import { routeForApp } from '../../lib/routes'

/**
 * Chuyển đổi nhãn (label) của ứng dụng thành khóa định danh (appKey) tương ứng.
 * @param {string} label - Nhãn ứng dụng cần chuyển đổi.
 * @returns {string} appKey của ứng dụng.
 */
export function keyFromLabel(label) {
  const k = routeForApp(label).replace('/', '')
  return k
}

/**
 * Xác định trang (page) của phần tử dựa trên thông tin tọa độ.
 * @param {Object} pos - Vị trí của phần tử chứa trường page.
 * @returns {number} Chỉ số trang (từ 0 trở lên).
 */
export function getPositionPage(pos) {
  const page = pos && Number.isInteger(pos.page) ? pos.page : 0
  return Math.max(0, page)
}

/**
 * Kiểm tra xem vị trí của một phần tử có thuộc về trang hiện tại đang hiển thị hay không.
 * @param {Object} pos - Vị trí phần tử cần kiểm tra.
 * @param {number} currentPage - Chỉ số trang hiện tại của Desktop.
 * @returns {boolean} true nếu phần tử nằm trên trang hiện tại.
 */
export function isPositionOnCurrentPage(pos, currentPage) {
  return getPositionPage(pos) === currentPage
}

/**
 * Làm tròn tọa độ bám dính vào lưới lưới vật lý (Snap to grid).
 * @param {number} value - Giá trị tọa độ thực tế.
 * @param {number} gridSize - Kích thước của mỗi ô lưới.
 * @param {boolean} gridEnabled - Trạng thái bật/tắt bám lưới.
 * @returns {number} Tọa độ đã bám lưới.
 */
export function snapToGrid(value, gridSize, gridEnabled) {
  if (!gridEnabled) return Math.round(value)
  return Math.round(Number(value || 0) / gridSize) * gridSize
}

/**
 * Giới hạn giá trị tọa độ bám lưới không vượt quá giá trị tối đa (max).
 * @param {number} value - Giá trị tọa độ thực tế.
 * @param {number} max - Tọa độ giới hạn lớn nhất cho phép.
 * @param {number} gridSize - Kích thước ô lưới.
 * @param {boolean} gridEnabled - Trạng thái bám lưới.
 * @returns {number} Tọa độ sau khi giới hạn và bám lưới.
 */
export function clampToGrid(value, max, gridSize, gridEnabled) {
  const snappedMax = Math.floor(Math.max(0, max) / gridSize) * gridSize
  return Math.max(0, Math.min(snappedMax, snapToGrid(value, gridSize, gridEnabled)))
}

/**
 * Giới hạn giá trị tọa độ bám lưới nằm trong dải từ min đến max.
 * @param {number} value - Giá trị tọa độ thực tế.
 * @param {number} min - Tọa độ giới hạn nhỏ nhất.
 * @param {number} max - Tọa độ giới hạn lớn nhất.
 * @param {number} gridSize - Kích thước ô lưới.
 * @param {boolean} gridEnabled - Trạng thái bám lưới.
 * @returns {number} Tọa độ nằm trong phạm vi cho phép và bám lưới.
 */
export function clampToGridRange(value, min, max, gridSize, gridEnabled) {
  const snappedMin = Math.ceil(Math.max(0, min) / gridSize) * gridSize
  const snappedMax = Math.floor(Math.max(snappedMin, max) / gridSize) * gridSize
  return Math.max(snappedMin, Math.min(snappedMax, snapToGrid(value, gridSize, gridEnabled)))
}

/**
 * Tính toán khoảng đệm lề dưới (Bottom Padding) thích hợp cho phần tử.
 * Widgets khi thu gọn (collapsed) sẽ cần khoảng đệm lớn hơn để tránh chồng đè.
 * @param {string} id - Định danh phần tử cần tính đệm lề.
 * @param {Object} widgetRects - Bản đồ lưu thông tin kích thước thực tế của các Widgets.
 * @returns {number} Kích thước khoảng đệm (pixel).
 */
export function getElementBottomPadding(id, widgetRects) {
  const widgetRect = id ? widgetRects[id] : null
  return widgetRect && widgetRect.collapsed ? 96 : 72
}

/**
 * Tính toán tọa độ Y lớn nhất cho phép của một phần tử để đảm bảo không bị tràn màn hình hoặc đè lên SideDock ở dưới chân.
 * @param {HTMLElement} root - Vùng chứa cha (EditOverlay hoặc DesktopMain).
 * @param {number} elementHeight - Chiều cao của phần tử cần tính toán.
 * @param {Object} widgetRects - Bản đồ lưu kích thước của các Widgets.
 * @param {HTMLElement} desktopMain - Tham chiếu tới phần tử DOM chính của Desktop.
 * @param {number} gridSize - Kích thước ô lưới.
 * @param {string} id - Định danh phần tử (nếu có).
 * @returns {number} Tọa độ Y tối đa cho phép.
 */
export function getElementMaxY(root, elementHeight, widgetRects, desktopMain, gridSize, id) {
  if (!root) return 0
  const rootRect = root.getBoundingClientRect()
  const height = Math.max(0, Number(elementHeight || 48))
  const padding = getElementBottomPadding(id, widgetRects)
  let bottomLimit = rootRect.height

  const desktop = desktopMain
  const dock = (root.querySelector && root.querySelector('[data-side-dock]')) || (desktop && desktop.querySelector('[data-side-dock]'))
  if (dock) {
    const dockRect = dock.getBoundingClientRect()
    const isBottomDock = dockRect.width > dockRect.height
    if (isBottomDock) {
      bottomLimit = Math.max(0, Math.round(dockRect.top - rootRect.top))
    }
  }

  return Math.max(0, bottomLimit - height - padding)
}

/**
 * Lấy kích thước ước lượng mặc định của các loại phần tử để tính toán lưới hoặc va chạm khi chưa đo được DOM thực tế.
 * @param {string} type - Loại phần tử ('widget', 'searchBar', hoặc 'icon').
 * @returns {Object} Chiều rộng và chiều cao ước lượng { width, height }.
 */
export function getApproxElementSize(type = 'icon') {
  if (type === 'widget') return { width: 240, height: 160 }
  if (type === 'searchBar') return { width: 520, height: 72 }
  return { width: 72, height: 84 }
}

/**
 * Lấy tọa độ X tối thiểu được phép đặt biểu tượng để không bị SideDock bên cạnh đè lên (chỉ áp dụng khi SideDock nằm dọc ở cạnh trái).
 * @param {HTMLElement} root - Vùng chứa cha cần tính toán.
 * @param {HTMLElement} desktopMain - Tham chiếu DOM chính của Desktop.
 * @param {number} gridSize - Kích thước ô lưới.
 * @param {boolean} gridEnabled - Trạng thái bám lưới.
 * @returns {number} Tọa độ X tối thiểu cho phép.
 */
export function getSideDockMinX(root, desktopMain, gridSize, gridEnabled) {
  const desktop = desktopMain
  const dock = desktop && desktop.querySelector('[data-side-dock]')

  if (!root || !dock) {
    return window.innerWidth >= 1024 ? 96 : 0
  }

  const rootRect = root.getBoundingClientRect()
  const dockRect = dock.getBoundingClientRect()
  const isSideDock = dockRect.height >= dockRect.width
  if (!isSideDock) return 0

  return snapToGrid(dockRect.right - rootRect.left + gridSize, gridSize, gridEnabled)
}
