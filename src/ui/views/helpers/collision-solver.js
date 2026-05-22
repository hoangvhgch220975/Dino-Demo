// Comment code bằng tiếng Việt, code logic bằng tiếng Anh
import { keyFromLabel } from './layout-helpers'

/**
 * Thu thập và kiểm tra trạng thái chiếm dụng (bị đặt đè) của tất cả các phần tử trên một trang cụ thể.
 * @param {Object} vm - Instance của Vue component (this).
 * @param {number} page - Chỉ số trang cần kiểm tra.
 * @returns {Array} Danh sách các phần tử chiếm dụng kèm tọa độ { id, x, y, width, height }.
 */
export function getPageOccupancy(vm, page) {
  const entries = []
  const push = (pos, width, height, id) => {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return
    if (vm.getPositionPage(pos) !== page) return
    entries.push({ id, x: pos.x, y: pos.y, width, height })
  }

  (vm.desktopApps || []).forEach(app => {
    const size = vm.getApproxElementSize(app.displayMode === 'widget' ? 'widget' : 'icon')
    push(app.position, size.width, size.height, app.appId)
  });
  (vm.widgets || []).forEach(widget => {
    const rect = vm.widgetRects[widget.id]
    const size = rect || vm.getApproxElementSize('widget')
    push(vm.widgetPositions[widget.id], size.width, size.height, widget.id)
  });
  Object.entries(vm.iconPositions || {}).forEach(([id, pos]) => {
    const size = vm.getApproxElementSize(id === 'searchBar' ? 'searchBar' : 'icon')
    push(pos, pos.width || size.width, size.height, id)
  })

  return entries
}

/**
 * Kiểm tra xem một vị trí hình học cụ thể trên trang hiện tại có trống/khả dụng hay không.
 * @param {Object} vm - Instance của Vue component (this).
 * @param {Object} options - Vị trí và thông số cần kiểm tra { x, y, width, height, page, ignoreIds }.
 * @returns {boolean} true nếu vị trí khả dụng.
 */
export function isPositionAvailableOnPage(vm, { x, y, width = 72, height = 84, page = vm.currentPage, ignoreIds = [] } = {}) {
  const occupied = getPageOccupancy(vm, page)
  const step = vm.gridSize
  
  // Hàm con kiểm tra va chạm giữa hai vùng chữ nhật có tính tới khoảng đệm lưới (step)
  const overlaps = (a, b) => (
    a.x < b.x + b.width + step
    && a.x + a.width + step > b.x
    && a.y < b.y + b.height + step
    && a.y + a.height + step > b.y
  )
  
  const candidate = { x, y, width, height }
  return !occupied
    .filter(entry => !ignoreIds.includes(entry.id))
    .some(entry => overlaps(entry, candidate))
}

/**
 * Quét toàn bộ lưới màn hình từ trên xuống dưới, trái qua phải để tìm vị trí còn trống đầu tiên có thể chứa phần tử.
 * Tự động chuyển qua các trang tiếp theo nếu trang hiện tại đã kín.
 * @param {Object} vm - Instance của Vue component.
 * @param {Object} size - Chiều rộng và chiều cao phần tử cần đặt.
 * @returns {Object} Vị trí trống tìm được gồm { x, y, page }.
 */
export function findFreePositionOnPage(vm, { width = 72, height = 84, startPage = vm.currentPage } = {}) {
  const root = vm.$refs.editOverlay || vm.$refs.desktopMain
  if (!root) return { x: vm.snapToGrid(40), y: vm.snapToGrid(80), page: startPage }
  const rect = root.getBoundingClientRect()
  const step = vm.gridSize
  const minX = vm.getSideDockMinX(root)
  const maxX = Math.max(minX, rect.width - width - step)

  const overlaps = (a, b) => (
    a.x < b.x + b.width + step
    && a.x + a.width + step > b.x
    && a.y < b.y + b.height + step
    && a.y + a.height + step > b.y
  )

  for (let page = Math.max(0, startPage); page < startPage + 20; page += 1) {
    const occupied = getPageOccupancy(vm, page)
    const maxY = vm.getElementMaxY(root, height)
    for (let y = vm.snapToGrid(80); y <= maxY; y += step) {
      for (let x = vm.snapToGrid(minX + step); x <= maxX; x += step) {
        const candidate = { x, y, width, height }
        if (!occupied.some(entry => overlaps(entry, candidate))) {
          return { x, y, page }
        }
      }
    }
  }

  return { x: vm.snapToGrid(minX + step), y: vm.snapToGrid(80), page: startPage + 1 }
}

/**
 * Thuật toán giải quyết va chạm nâng cao của Desktop.
 * Khi một phần tử thay đổi vị trí, kiểm tra đè và dịch chuyển các phần tử khác tới vị trí khả dụng gần nhất.
 * Nếu không còn vị trí trên trang hiện tại, tự động đẩy sang các trang trống tiếp theo.
 * @param {Object} vm - Instance của Vue component.
 * @param {string} changedId - Định danh của phần tử vừa di chuyển để kiểm soát đệ quy (nếu có).
 */
export function resolveAllElementOverlaps(vm, changedId) {
  if (vm.draggingElement) return
  const root = vm.isEditMode ? vm.$refs.editOverlay : vm.$refs.desktopMain
  if (!root) return

  const seenApps = new Set()
  const deduplicatedDesktopApps = (vm.desktopApps || []).filter(d => {
    if (!d || !d.appId) return false
    if (seenApps.has(d.appId)) return false
    seenApps.add(d.appId)
    return true
  })
  const desktopAppIds = new Set(deduplicatedDesktopApps.map((app) => app.appId))
  const entries = []
  const rootRect = root.getBoundingClientRect()

  const pushEntry = ({ id, type, pos, width, height, priority }) => {
    if (!id || !pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return
    entries.push({
      id,
      type,
      x: pos.x,
      y: pos.y,
      width: Math.max(vm.gridSize, vm.snapToGrid(Math.ceil(width || vm.gridSize))),
      height: Math.max(vm.gridSize, vm.snapToGrid(Math.ceil(height || vm.gridSize))),
      priority,
    })
  }

  const obstacleRoot = vm.$refs.desktopMain || root
  const isDesktop = window.innerWidth >= 1024
  if (isDesktop) {
    entries.push({
      id: 'sideDock_virtual_obstacle',
      type: 'obstacle',
      x: 0,
      y: 0,
      width: vm.getSideDockMinX(root),
      height: vm.snapToGrid(rootRect.height),
      priority: 0,
    })
  } else {
    obstacleRoot.querySelectorAll('[data-side-dock]').forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const dockPadding = vm.gridSize * 4
      entries.push({
        id: `sideDock_${index}`,
        type: 'obstacle',
        x: vm.snapToGrid(rect.left - rootRect.left - dockPadding),
        y: vm.snapToGrid(rect.top - rootRect.top - dockPadding),
        width: Math.max(vm.gridSize, vm.snapToGrid(Math.ceil(rect.width + dockPadding * 2))),
        height: Math.max(vm.gridSize, vm.snapToGrid(Math.ceil(rect.height + dockPadding * 2))),
        priority: 0,
      })
    })
  }

  root.querySelectorAll('[data-widget-id]').forEach((el) => {
    const id = el.getAttribute('data-widget-id')
    const pos = vm.widgetPositions[id]
    const rect = el.getBoundingClientRect()
    pushEntry({ id, type: 'widget', pos, width: rect.width, height: rect.height, priority: 10 })
  })

  root.querySelectorAll('[data-label]').forEach((el) => {
    const id = el.getAttribute('data-label')
    if (id === 'statusPanel') return
    const rect = el.getBoundingClientRect()
    const appId = keyFromLabel(id)
    if (desktopAppIds.has(appId)) {
      const app = deduplicatedDesktopApps.find((item) => item.appId === appId)
      pushEntry({ id: appId, type: 'desktopApp', pos: app && app.position, width: rect.width, height: rect.height, priority: 30 })
      return
    }
    if (vm.iconPositions[id]) {
      pushEntry({ id, type: 'icon', pos: vm.iconPositions[id], width: rect.width, height: rect.height, priority: 20 })
    }
  })

  entries.sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.priority - b.priority))

  const nextWidgetPositions = { ...vm.widgetPositions }
  const nextIconPositions = { ...vm.iconPositions }
  const nextDesktopApps = deduplicatedDesktopApps.map((app) => ({ ...app, position: app.position ? { ...app.position } : app.position }))
  let changed = false

  const overlaps = (a, b) => {
    const isObstacle = a.type === 'obstacle' || b.type === 'obstacle'
    const isStatusElement = (id) => ['status_greeting', 'status_clock', 'status_date', 'status_weather'].includes(id)
    const hasStatus = isStatusElement(a.id) || isStatusElement(b.id)

    const padding = (isObstacle || hasStatus) ? 0 : vm.gridSize
    return a.x < b.x + b.width + padding
      && a.x + a.width + padding > b.x
      && a.y < b.y + b.height + padding
      && a.y + a.height + padding > b.y
  }

  const findNearestFreePosition = (entry, placed) => {
    const maxX = Math.floor(Math.max(0, rootRect.width - entry.width) / vm.gridSize) * vm.gridSize
    const maxY = Math.floor(vm.getElementMaxY(root, entry.height, { id: entry.id }) / vm.gridSize) * vm.gridSize
    const originX = vm.clampToGrid(entry.x, maxX)
    const originY = vm.clampToGrid(entry.y, maxY)

    const candidateWorks = (x, y) => {
      const candidate = { ...entry, x, y }
      return !placed.some((item) => overlaps(item, candidate))
    }

    if (candidateWorks(originX, originY)) return { x: originX, y: originY }

    const maxRadius = Math.ceil(Math.max(rootRect.width, rootRect.height) / vm.gridSize)
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      const candidates = []
      for (let dx = -radius; dx <= radius; dx += 1) {
        candidates.push({ x: originX + dx * vm.gridSize, y: originY - radius * vm.gridSize })
        candidates.push({ x: originX + dx * vm.gridSize, y: originY + radius * vm.gridSize })
      }
      for (let dy = -radius + 1; dy <= radius - 1; dy += 1) {
        candidates.push({ x: originX - radius * vm.gridSize, y: originY + dy * vm.gridSize })
        candidates.push({ x: originX + radius * vm.gridSize, y: originY + dy * vm.gridSize })
      }

      candidates.sort((a, b) => {
        const da = Math.abs(a.x - originX) + Math.abs(a.y - originY)
        const db = Math.abs(b.x - originX) + Math.abs(b.y - originY)
        return da - db || a.y - b.y || a.x - b.x
      })

      const found = candidates.find((candidate) => (
        candidate.x >= 0
        && candidate.y >= 0
        && candidate.x <= maxX
        && candidate.y <= maxY
        && candidateWorks(candidate.x, candidate.y)
      ))
      if (found) return found
    }

    return { x: originX, y: originY }
  }

  const placed = []
  for (let i = 0; i < entries.length; i += 1) {
    const current = entries[i]
    if (current.type === 'obstacle') {
      placed.push(current)
      continue
    }
    const nextPos = findNearestFreePosition(current, placed)
    
    // Kiểm tra xem vị trí mới tìm được có bị chồng lấn hay không
    const isOverlapping = placed.some(item => overlaps(item, { ...current, x: nextPos.x, y: nextPos.y }))
    
    if (isOverlapping && current.type !== 'obstacle') {
      // Không tìm thấy vị trí khả dụng trên trang này -> tự động đẩy phần tử sang trang kế tiếp
      const size = { width: current.width, height: current.height }
      const freePos = findFreePositionOnPage(vm, { width: size.width, height: size.height, startPage: vm.currentPage + 1 })
      
      // Cập nhật tọa độ và đặt trang mới cho phần tử
      if (current.type === 'widget') {
        nextWidgetPositions[current.id] = { ...nextWidgetPositions[current.id], x: freePos.x, y: freePos.y, page: freePos.page }
      } else if (current.type === 'desktopApp') {
        const idx = nextDesktopApps.findIndex((app) => app.appId === current.id)
        if (idx !== -1) {
          nextDesktopApps[idx].position = { ...nextDesktopApps[idx].position, x: freePos.x, y: freePos.y, page: freePos.page }
        }
      } else {
        nextIconPositions[current.id] = { ...nextIconPositions[current.id], x: freePos.x, y: freePos.y, page: freePos.page }
      }
      changed = true
      continue // Bỏ qua không đẩy vào placed của trang hiện tại
    }

    if (nextPos.x !== current.x || nextPos.y !== current.y) {
      current.x = nextPos.x
      current.y = nextPos.y
      if (current.type === 'widget') {
        nextWidgetPositions[current.id] = { ...nextWidgetPositions[current.id], x: nextPos.x, y: nextPos.y }
      } else if (current.type === 'desktopApp') {
        const idx = nextDesktopApps.findIndex((app) => app.appId === current.id)
        if (idx !== -1) {
          nextDesktopApps[idx].position = { ...nextDesktopApps[idx].position, x: nextPos.x, y: nextPos.y }
        }
      } else {
        nextIconPositions[current.id] = { ...nextIconPositions[current.id], x: nextPos.x, y: nextPos.y }
      }
      changed = true
    }
    placed.push(current)
  }

  if (changed) {
    vm.widgetPositions = nextWidgetPositions
    vm.iconPositions = nextIconPositions
    const seen = new Set()
    vm.desktopApps = nextDesktopApps.filter(d => {
      if (!d || !d.appId) return false
      if (seen.has(d.appId)) return false
      seen.add(d.appId)
      return true
    })
    vm.saveLayout()
    if (changedId) {
      window.setTimeout(() => vm.resolveAllElementOverlaps(), 80)
    }
  }
}
