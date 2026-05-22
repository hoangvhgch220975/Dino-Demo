<template>
  <div class="dark">
    <div class="text-on-surface font-body-md overflow-hidden h-screen w-screen selection:bg-primary selection:text-on-primary">
      <WallpaperBackground :src="currentWallpaper" />
      <TopNavBar 
        @open-app="openAppByKey($event, { syncRoute: true })" 
        @open-help="showHelpDialog = true"
        :has-more="moreApps.length > 0"
        :more-apps-grouped="moreAppsGrouped"
      />

      <main 
        class="relative h-full w-full pb-32 px-12 flex flex-col items-center justify-start overflow-hidden pt-8"
        ref="desktopMain"
        @dragover.prevent
        @dragenter.prevent
        @drop="handleDrop"
        @pointerdown="handleBackgroundPointerDown"
      >
        <!-- Selection Box -->
        <div
          v-if="isSelecting"
          class="absolute border-2 border-sky-400 bg-sky-400/20 pointer-events-none rounded-[6px] z-50 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          :style="selectionBoxStyle"
        ></div>

        <!-- Error Dialog -->
        <transition name="fade">
          <div v-if="showGroupError" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
            <div class="glass-panel noise-overlay rounded-[18px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl px-8 py-6 min-w-[320px] max-w-[90vw] text-center text-white">
              <div class="text-rose-400 text-lg font-bold mb-2">Không thể di chuyển!</div>
              <div class="text-white/80 mb-4">Bạn không thể kéo ứng dụng vào nhóm Product hoặc kéo Product vào nhóm App.</div>
              <button class="mt-2 px-6 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition" @click="showGroupError = false">Đóng</button>
            </div>
          </div>
        </transition>

        <!-- Add Label Dialog (custom, replaces native prompt) -->
        <transition name="fade">
          <div v-if="showAddLabelDialog" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <div class="glass-panel noise-overlay rounded-[16px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl w-[min(560px,90vw)] px-6 py-6 text-white">
              <div class="text-[16px] font-bold text-white mb-2">Thêm nhóm mới</div>
              <div class="text-sm text-white/80 mb-4">Nhập nội dung label:</div>
              <input ref="addLabelInput" v-model="newLabelText" class="w-full px-3 py-2 rounded-md bg-white/[0.02] border border-white/8 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/10" placeholder="Nhập tên nhóm" />
              <div class="mt-4 flex justify-end gap-3">
                <button class="px-4 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.06] text-white/80" @click="cancelAddLabel">Hủy</button>
                <button class="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:brightness-95" @click="confirmAddLabel">OK</button>
              </div>
            </div>
          </div>
        </transition>
        <transition name="fade">
          <div v-if="showRenameGroupDialog" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <div class="glass-panel noise-overlay rounded-[16px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl w-[min(480px,90vw)] px-6 py-6 text-white">
              <div class="text-[16px] font-bold text-white mb-2">Đổi tên group</div>
              <div class="text-sm text-white/80 mb-4">Nhập tên group mới:</div>
              <input
                ref="renameGroupInput"
                v-model="renameGroupText"
                class="w-full px-3 py-2 rounded-md bg-white/[0.02] border border-white/8 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Tên group"
                @keyup.enter="confirmRenameGroup"
              />
              <div class="mt-4 flex justify-end gap-3">
                <button class="px-4 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.06] text-white/80" @click="cancelRenameGroup">Hủy</button>
                <button class="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:brightness-95" @click="confirmRenameGroup">OK</button>
              </div>
            </div>
          </div>
        </transition>
        <!-- Help Dialog -->
        <HelpDialog v-if="showHelpDialog" @close="showHelpDialog = false" />
        <!-- Global overlay removed to allow drag/drop; edit overlay handles background clicks -->
        <div
          v-if="totalDesktopPages > 1 || isEditMode"
          class="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3 py-2 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          @pointerdown.stop
          @click.stop
        >
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white disabled:opacity-35"
            :disabled="currentPage <= 0"
            @click="setDesktopPage(currentPage - 1)"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            v-for="page in totalDesktopPages"
            :key="'page_' + page"
            :class="[
              'h-2.5 rounded-full transition-all',
              currentPage === page - 1 ? 'w-7 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'
            ]"
            :aria-label="`Page ${page}`"
            @click="setDesktopPage(page - 1)"
          ></button>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white disabled:opacity-35"
            :disabled="currentPage >= totalDesktopPages - 1"
            @click="setDesktopPage(currentPage + 1)"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <button
            v-if="isEditMode"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white"
            @click="addNewPage"
            title="Thêm trang mới"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        <div v-show="!isEditMode" data-label="statusPanel">
            <StatusPanel
              :positioned="hasPositionedStatusPanel"
              :element-positions="iconPositions"
              @element-pointerdown="startElementLongPress"
              @element-pointerup="cancelElementLongPress"
            />
        </div>

        <div v-show="!isEditMode" class="relative" :style="mainElementStyle('searchBar')" :class="{ 'pointer-events-auto z-30': hasPositionedSearchBar }">
            <div
              data-label="searchBar"
              class="cursor-grab active:cursor-grabbing transition-[filter] hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.22)]"
              @pointerdown="startElementLongPress('searchBar', $event)"
              @pointerup="cancelElementLongPress"
              @pointercancel="cancelElementLongPress"
              @pointerleave="cancelElementLongPress"
            >
              <SearchBar v-model="query" :width="iconPositions.searchBar && iconPositions.searchBar.width || null" />
            </div>
            <div
              v-if="showSearchResults"
              class="glass-panel noise-overlay absolute left-1/2 top-[calc(100%-16px)] z-50 w-[min(620px,calc(100vw-48px))] -translate-x-1/2 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
              @pointerdown.stop
              @click.stop
            >
              <div class="flex items-center justify-between border-b border-white/8 bg-white/[0.035] px-4 py-3">
                <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <span class="material-symbols-outlined text-[17px] text-white/45">manage_search</span>
                  Results
                </div>
                <button class="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/50 transition hover:bg-white/10 hover:text-white" @click="query = ''">
                  <span class="material-symbols-outlined text-[17px]">close</span>
                </button>
              </div>

              <div v-if="searchResults.length" class="max-h-[360px] overflow-y-auto p-2.5">
                <button
                  v-for="app in searchResults"
                  :key="app.key"
                  class="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/[0.075] focus:border-white/12 focus:bg-white/[0.08] focus:outline-none"
                  @click="openSearchResult(app.key)"
                >
                  <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-[0_10px_24px_rgba(0,0,0,0.28)] ring-1 ring-white/10 transition group-hover:scale-105', app.gradient || 'from-slate-600 to-slate-800']">
                    <span class="material-symbols-outlined text-[22px] text-white">{{ app.icon || 'apps' }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-[14px] font-bold text-white">{{ app.label }}</div>
                    <div class="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-white/42">
                      <span class="truncate">{{ app.section }}</span>
                      <span class="h-1 w-1 rounded-full bg-white/25"></span>
                      <span>{{ app.location }}</span>
                    </div>
                  </div>
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.045] text-white/30 transition group-hover:bg-white/10 group-hover:text-white/70">
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </button>
              </div>

              <div v-else class="flex flex-col items-center justify-center px-6 py-8 text-center">
                <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.05]">
                  <span class="material-symbols-outlined text-white/55">search_off</span>
                </div>
                <div class="text-[14px] font-bold text-white/80">No apps found</div>
                <div class="mt-1 text-[12px] text-white/45">Try a different app name.</div>
              </div>
            </div>
        </div>

    <!-- Desktop icons removed from main UI: groups manage apps internally -->

    <!-- Edit-mode floating icons overlay -->
    <div v-if="isEditMode" class="absolute inset-0 z-50">
      <div
        ref="editOverlay"
        class="relative w-full h-full min-h-[500px]"
        @dragover.prevent="handleDesktopDragOver"
        @drop="handleDesktopDrop"
        @click="onEditOverlayClick"
        @pointerdown="handleBackgroundPointerDown"
      >
        <div v-if="devMode && showGrid" class="absolute inset-0 pointer-events-none" :style="gridStyle"></div>
        <div v-if="devMode && showGrid" class="absolute left-0 right-0 top-0 h-8 pointer-events-none z-40 border-b border-white/15 bg-black/20 backdrop-blur-[2px]">
          <div
            v-for="tick in horizontalRulerTicks"
            :key="'x_' + tick"
            class="absolute top-0 h-8 border-l border-white/25"
            :class="{ 'border-white/45': tick % 96 === 0 }"
            :style="{ left: `${tick}px` }"
          >
            <span v-if="tick % 96 === 0" class="absolute left-1 top-1 text-[10px] font-semibold text-white/65 leading-none">{{ tick }}</span>
          </div>
        </div>
        <div v-if="devMode && showGrid" class="absolute bottom-0 left-0 top-0 w-10 pointer-events-none z-40 border-r border-white/15 bg-black/20 backdrop-blur-[2px]">
          <div
            v-for="tick in verticalRulerTicks"
            :key="'y_' + tick"
            class="absolute left-0 w-10 border-t border-white/25"
            :class="{ 'border-white/45': tick % 96 === 0 }"
            :style="{ top: `${tick}px` }"
          >
            <span v-if="tick % 96 === 0" class="absolute left-1 top-1 text-[10px] font-semibold text-white/65 leading-none">{{ tick }}</span>
          </div>
        </div>
        <div class="absolute top-4 right-6 z-50 flex gap-2">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/85 text-[13px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-200 active:scale-95"
            @click.stop="promptAddLabel"
          >
            <span class="material-symbols-outlined text-[16px]">create_new_folder</span>
            Add a Group
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/85 text-[13px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-200 active:scale-95"
            @click.stop="$refs.wallpaperInput.click()"
          >
            <span class="material-symbols-outlined text-[16px]">wallpaper</span>
            Change Wallpaper
          </button>
          <input type="file" ref="wallpaperInput" class="hidden" accept="image/*" @change="onWallpaperFileChange" />
        </div>
        <!-- Positioned clones for each labeled element (movable but not deletable) -->
        <template v-for="(pos, key) in currentPageIconPositions" :key="key">
          <!-- searchBar is rendered separately below with resize handle -->
          <div v-if="elementHtml[key] && key !== 'searchBar'" :style="posStyle(pos)" class="pointer-events-auto cursor-move" @pointerdown.stop="startPointerDrag(key, $event)" v-html="elementHtml[key]"></div>
        </template>

        <!-- Search bar: draggable + resizable in edit mode -->
        <div
          v-if="iconPositions.searchBar && isPositionOnCurrentPage(iconPositions.searchBar)"
          :style="searchBarEditStyle"
          class="pointer-events-auto"
          data-label="searchBar"
        >
          <div
            class="relative cursor-move"
            @pointerdown.stop="startPointerDrag('searchBar', $event)"
          >
          <SearchBar :width="iconPositions.searchBar.width || null" />
            <!-- Resize handle at bottom-right -->
            <div
              class="absolute bottom-6 right-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-white/40 cursor-se-resize text-white hover:bg-white/40 transition-all z-20 shadow-lg"
              title="Kéo để thay đổi chiều rộng"
              @pointerdown.stop="startSearchBarResize($event)"
            >
              <span class="material-symbols-outlined text-[15px]">drag_handle</span>
            </div>
          </div>
        </div>

        <template v-for="d in desktopIcons" :key="d.key">
          <AppWidgetTile
            v-if="d.displayMode === 'widget'"
            :app-id="d.appId"
            :label="d.label"
            :icon="d.icon"
            :gradient="d.gradient"
            :is-edit-mode="true"
            :position="d.position"
            :is-selected="selectedAppIds.has(d.appId)"
            :is-dragging="draggingElement === d.appId"
            @toggle-mode="handleAppToggleMode"
            @remove="label => removeAppFromSection({ label })"
            @pointerdown="startPointerDrag(d.appId, $event)"
          />
          <AppIconTile
            v-else
            :app-id="d.appId"
            :label="d.label"
            :icon="d.icon"
            :gradient="d.gradient"
            :icon-image="d.isProduct ? d.productIconUrl : ''"
            :fallback-letter="d.isProduct ? firstLetter(d.label) : ''"
            :allow-icon-upload="d.isProduct"
            :is-edit-mode="true"
            :draggable="false"
            :position="d.position"
            :owner="ownerMap[d.appId]"
            :is-selected="selectedAppIds.has(d.appId)"
            @pointerdown="startPointerDrag(d.appId, $event)"
            @remove="label => removeAppFromSection({ label })"
            @enable-edit="isEditMode = true"
            @icon-upload="handleProductIconUpload"
            @toggle-mode="handleAppToggleMode"
          />
        </template>
        <WidgetTile
          v-for="w in visibleWidgets"
          :key="w.id"
          :id="w.id"
          :type="w.type"
          :content="w.content"
            :items="(w.appIds || w.items || []).map(a => {
                if (!a) return null;
                if (typeof a === 'string') return appsById[a] || { label: a, key: a, icon: 'apps' };
                if (typeof a === 'object') return (a.key || a.label) ? a : { label: String(a), key: String(a) };
                return null;
              }).filter(Boolean)"
          :is-edit-mode="isEditMode"
          :position="widgetPositions[w.id]"
          :owner-map="ownerMap"
          @remove="removeWidget"
          @pointerdown="startPointerDrag(w.id, $event)"
          @dragstart="(e, id) => startPointerDrag(w.id, e)"
          @update-content="updateWidgetContent"
          @rename-request="openRenameGroupDialog"
          @drop-into="handleWidgetDrop"
          @open="openAppByLabel"
          @enable-edit="enterEditMode"
          @start-drag="(ev, id) => { this.enterEditMode(); this.$nextTick(() => { this.startPointerDrag(id, ev); }); }"
          @remove-from-widget="removeAppFromWidget"
          @measure="onWidgetMeasure"
          @icon-upload="handleProductIconUpload"
        />
      </div>
    </div>

    <!-- Widgets always visible outside edit overlay -->
    <div v-if="!isEditMode">
      <WidgetTile
        v-for="w in visibleWidgets"
        :key="w.id + '_view'"
        :id="w.id"
        :type="w.type"
        :content="w.content"
        :items="(w.appIds || w.items || []).map(a => (typeof a === 'string' ? (appsById[a] || { label: a, key: a, icon: 'apps' }) : a))"
        :is-edit-mode="isEditMode"
        :position="widgetPositions[w.id]"
        @update-content="updateWidgetContent"
        @rename-request="openRenameGroupDialog"
        @drop-into="handleWidgetDrop"
        @open="openAppByLabel"
        @enable-edit="enterEditMode"
        @start-drag="(ev, id) => { this.enterEditMode(); this.$nextTick(() => { this.startPointerDrag(id, ev); }); }"
        @remove-from-widget="removeAppFromWidget"
        @measure="onWidgetMeasure"
        @icon-upload="handleProductIconUpload"
      />
    </div>

    <!-- Render positioned desktop icons when NOT in edit mode so they remain visible -->
    <div v-if="!isEditMode">
      <template v-for="d in desktopIcons" :key="'desk_'+d.key">
        <AppWidgetTile
          v-if="d.displayMode === 'widget'"
          :app-id="d.appId"
          :label="d.label"
          :icon="d.icon"
          :gradient="d.gradient"
          :is-edit-mode="false"
          :position="d.position"
          :is-selected="selectedAppIds.has(d.appId)"
          @open="openAppByLabel"
          @enable-edit="enterEditMode"
        />
        <AppIconTile
          v-else
          :app-id="d.appId"
          :label="d.label"
          :icon="d.icon"
          :gradient="d.gradient"
          :icon-image="d.isProduct ? d.productIconUrl : ''"
          :fallback-letter="d.isProduct ? firstLetter(d.label) : ''"
          :allow-icon-upload="d.isProduct"
          :is-edit-mode="false"
          :draggable="false"
          :position="d.position"
          :owner="ownerMap[d.appId]"
          :is-selected="selectedAppIds.has(d.appId)"
          @open="openAppByLabel"
          @enable-edit="enterEditMode"
          @icon-upload="handleProductIconUpload"
        />
      </template>
    </div>

        <!-- Windows Layer (must NOT block desktop icon clicks) -->
        <div class="fixed inset-0 pointer-events-none z-40">
          <AppWindow
            v-for="w in visibleWindows"
            :key="w.key"
            :app="w"
            :rect="w.rect"
            :z="w.z"
            :isFocused="w.key === activeKey"
            :isExiting="!!w.exiting"
            :motion="w.motion"
            :maximized="!!w.maximized"
            :safe-area-left="getSideDockMinX($refs.desktopMain)"
            class="pointer-events-auto"
            @focus="focusWindow(w.key)"
            @minimize="minimizeWindow(w.key)"
            @close="closeWindow(w.key)"
            @move="moveWindow(w.key, $event)"
            @toggle-maximize="toggleMaximizeWindow(w.key)"
          />
        </div>

        <SideDock
          v-if="openWindows.length"
          :apps="dockApps"
          :active-key="activeKey"
          @open="activateFromDock"
          @close="closeWindow"
        />
      </main>
    </div>
  </div>
</template>

<script>
import WallpaperBackground from '../components/WallpaperBackground.vue'
import TopNavBar from '../components/TopNavBar.vue'
import SearchBar from '../components/SearchBar.vue'
import StatusPanel from '../components/StatusPanel.vue'
import AppWindow from '../components/AppWindow.vue'
import SideDock from '../components/SideDock.vue'
import AppIconTile from '../components/AppIconTile.vue'
import WidgetTile from '../components/WidgetTile.vue'
import AppWidgetTile from '../components/AppWidgetTile.vue'
import HelpDialog from '../components/HelpDialog.vue'

import { appSections } from '../lib/apps-definitions'
import { routeForApp } from '../lib/routes'
import { appsRegistry, getAppByKey } from '../lib/apps-registry'
import { getDockCenterForKey } from '../lib/geometry'

const keyFromLabel = (label) => {
  const k = routeForApp(label).replace('/', '')
  return k
}

export default {
  name: 'DesktopView',
  components: {
    WallpaperBackground,
    TopNavBar,
    SearchBar,
    StatusPanel,
    AppWindow,
    SideDock,
    AppIconTile,
    WidgetTile,
    AppWidgetTile,
    HelpDialog,
  },
  data() {
    const initialSelected = new Set();
    // The apps enabled by Admin will be shown (on User side).
    // Here we select some default apps to display on the Main UI (the rest go to the Dropdown).
    appSections.forEach(s => {
      s.items.slice(0, 10).forEach(i => {
        initialSelected.add(keyFromLabel(i.label || i.title));
      });
    });

    return {
      showHelpDialog: false,
      currentWallpaper: localStorage.getItem('desktop_wallpaper') || undefined,
      query: '',
      isEditMode: false,
      selectedAppKeys: initialSelected, // Khởi tạo với các app "enable"
      sections: appSections.map((s) => ({
        ...s,
        items: s.items.map((i) => ({
          ...i,
          label: i.label || i.title,
        })),
      })),
      // Free-placement positions for icons when in edit mode: { [label]: { x, y } }
      iconPositions: {},
      // grid settings
      devMode: true,
      gridEnabled: false,
      gridSize: 24,
      showGrid: true,
      currentPage: 0,
      customTotalPages: 0, // Số lượng trang trống do người dùng tạo thủ công trong chế độ Edit
      widgets: [],
      widgetPositions: {},
      widgetRects: {},
      // dragging state for pointer-drag (for non-app elements)
      draggingElement: null,
      dragOffset: { x: 0, y: 0 },
      // transient drag payload
      dragPayload: null,
      // long press tracking for top elements
      elementLongPressTimer: null,
      elementLongPressEvent: null,
      elementLongPressId: null,
      // snapshot HTML of labeled elements for per-element clones in edit overlay
      elementHtml: {},
      // loose desktop apps (source of truth for apps placed on desktop)
      desktopApps: [], // [{ appId: 'countdown', position: { x, y } }]
      productIconUrls: {},
      // internal cleanup for active pointer drag
      dragCleanup: null,
      openWindows: (() => {
        try {
          const raw = localStorage.getItem('desktop_open_windows');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              return list.map(item => {
                if (!item || !item.key) return null;
                const base = getAppByKey(item.key);
                if (!base) return null;
                return {
                  ...base,
                  rect: item.rect,
                  z: typeof item.z === 'number' ? item.z : 10,
                  minimized: !!item.minimized,
                  maximized: item.maximized !== undefined ? !!item.maximized : true,
                  exiting: false,
                  motion: { from: null, to: null },
                };
              }).filter(Boolean);
            }
          }
        } catch (e) {
          // ignore
        }
        return [];
      })(),
      activeKey: '',
      zCounter: (() => {
        try {
          const raw = localStorage.getItem('desktop_open_windows');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let maxZ = 10;
              list.forEach(item => {
                if (item && typeof item.z === 'number' && item.z > maxZ) {
                  maxZ = item.z;
                }
              });
              return maxZ;
            }
          }
        } catch (e) {
          // ignore
        }
        return 10;
      })(),
      showGroupError: false,
      showAddLabelDialog: false,
      newLabelText: '',
      showRenameGroupDialog: false,
      renameGroupId: '',
      renameGroupText: '',
      widgetOriginalY: {},
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedAppIds: new Set(),
      draggedAppId: null,
      dragStartPositions: {},
    }
  },
  computed: {
    appsById() {
      const map = {};
      this.sections.forEach(s => s.items.forEach(i => {
        const lbl = i.label || i.title;
        const key = keyFromLabel(lbl);
        const isProduct = s.title === 'Product';
        map[key] = {
          id: key,
          name: i.title || lbl,
          label: lbl,
          icon: i.icon || 'apps',
          gradient: i.gradient,
          isProduct,
          productIconUrl: isProduct ? (this.productIconUrls[key] || '') : '',
        };
      }));
      return map;
    },
    ownerMap() {
      const m = {};
      (this.widgets || []).forEach(w => {
        if (!Array.isArray(w.appIds)) return;
        const name = (w.content && (w.content.text || w.content.label)) ? (w.content.text || w.content.label) : (w.title || w.id);
        w.appIds.forEach(a => { if (a) m[String(a)] = { id: w.id, name }; });
      });
      return m;
    },
    desktopIcons() {
      // Render only loose desktop apps (from desktopApps array). Groups render their own items.
      const seen = new Set();
      return (this.desktopApps || [])
        .filter(a => {
          if (!a || !a.appId) return false;
          if (!this.isPositionOnCurrentPage(a.position)) return false;
          if (seen.has(a.appId)) return false;
          seen.add(a.appId);
          return true;
        })
        .map(a => {
          const info = this.appsById[a.appId] || { id: a.appId, label: a.appId, icon: 'apps' };
          return {
            appId: a.appId,
            label: info.label || info.name || a.appId,
            key: a.appId,
            icon: info.icon,
            gradient: info.gradient || 'from-slate-600 to-slate-800',
            position: a.position,
            isProduct: !!info.isProduct,
            productIconUrl: info.productIconUrl || '',
            displayMode: a.displayMode || 'icon',
          };
        });
    },
    visibleWidgets() {
      return (this.widgets || []).filter(w => this.isPositionOnCurrentPage(this.widgetPositions[w.id]));
    },
    currentPageIconPositions() {
      const next = {};
      Object.entries(this.iconPositions || {}).forEach(([key, pos]) => {
        if (this.isPositionOnCurrentPage(pos)) next[key] = pos;
      });
      return next;
    },
    totalDesktopPages() {
      // Tìm số trang lớn nhất từ tọa độ vị trí của các phần tử hiện có
      let maxPage = 0;
      const visit = (pos) => {
        const page = this.getPositionPage(pos);
        if (page > maxPage) maxPage = page;
      };
      Object.values(this.iconPositions || {}).forEach(visit);
      Object.values(this.widgetPositions || {}).forEach(visit);
      (this.desktopApps || []).forEach(app => visit(app && app.position));
      
      const calculatedPages = maxPage + 1;
      // Kết hợp số trang thực tế với số trang được người dùng tạo thủ công (customTotalPages)
      return Math.max(calculatedPages, this.customTotalPages || 1);
    },
    gridStyle() {
      return {
        opacity: 0.82,
        backgroundImage: [
          'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
          'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '96px 96px, 96px 96px, 24px 24px, 24px 24px',
        backgroundPosition: '0 0',
      };
    },
    horizontalRulerTicks() {
      return Array.from({ length: 84 }, (_, i) => i * 24)
    },
    verticalRulerTicks() {
      return Array.from({ length: 52 }, (_, i) => i * 24)
    },
    // Tách riêng apps và products sections
    appSection() {
      return this.sections.find(s => s.title === 'Apps')
    },
    productSection() {
      return this.sections.find(s => s.title === 'Product')
    },
    
    // Apps đã chọn (Hiện tất cả app được enable, không giới hạn 16 nữa)
    selectedAppItems() {
      if (!this.appSection) return []
      return this.appSection.items.filter(i => 
        this.selectedAppKeys.has(keyFromLabel(i.label || i.title))
      )
    },
    hiddenAppItems() {
      return [] // Không còn ẩn app đã enable
    },
    
    // Products đã chọn
    selectedProductItems() {
      if (!this.productSection) return []
      return this.productSection.items.filter(i => 
        this.selectedAppKeys.has(keyFromLabel(i.label || i.title))
      )
    },
    hiddenProductItems() {
      return []
    },
    
    // Apps để hiện trong dropdown More (Chỉ hiện app disable/chưa chọn)
    moreApps() {
      return this.sections.flatMap(s => s.items).filter(i => 
        !this.selectedAppKeys.has(keyFromLabel(i.label || i.title))
      )
    },
    moreAppsGrouped() {
      const grouped = {}
      this.sections.forEach(s => {
        const items = s.items.filter(i => !this.selectedAppKeys.has(keyFromLabel(i.label || i.title)));
        if (items.length) grouped[s.title] = items.map(i => ({ ...i, label: i.label || i.title }));
      })
      return grouped
    },
    showSearchResults() {
      return !this.isEditMode && String(this.query || '').trim().length > 0
    },
    searchResults() {
      const q = String(this.query || '').trim().toLowerCase()
      if (!q) return []

      return this.sections
        .flatMap((section) => section.items.map((item) => {
          const label = item.label || item.title
          const key = keyFromLabel(label)
          const inDesktop = (this.desktopApps || []).some((app) => app.appId === key)
          const group = (this.widgets || []).find((widget) => Array.isArray(widget.appIds) && widget.appIds.includes(key))
          return {
            key,
            label,
            section: section.title === 'Apps' ? 'App' : section.title,
            icon: item.icon || 'apps',
            gradient: item.gradient,
            location: group
              ? `In ${group.content?.text || group.content?.label || 'group'}`
              : inDesktop ? 'On desktop' : 'Available',
          }
        }))
        .filter((app) => app.label.toLowerCase().includes(q) || app.key.toLowerCase().includes(q) || app.section.toLowerCase().includes(q))
        .slice(0, 12)
    },
    
    filteredSections() {
      const q = String(this.query || '').trim().toLowerCase()
      
      if (q) {
        return this.sections
          .map(s => ({
            ...s,
            items: s.items.filter(
              i =>
                String(i.title || '').toLowerCase().includes(q) ||
                String(i.label || '').toLowerCase().includes(q)
            )
          }))
          .filter((s) => s.items.length > 0)
      }

      if (this.isEditMode) {
        return []; // Hide main grid in edit mode
      }
      
      const result = []
      if (this.selectedAppItems.length > 0) {
        result.push({ ...this.appSection, items: this.selectedAppItems, title: 'App' })
      }
      if (this.selectedProductItems.length > 0) {
        result.push({ ...this.productSection, items: this.selectedProductItems, title: 'Product' })
      }
      return result
    },
    
    visibleWindows() {
      return this.openWindows.filter((w) => !w.minimized || w.exiting)
    },
    dockApps() {
      return this.openWindows.map((app) => {
        const info = this.appsById[app.key] || {};
        return {
          ...app,
          icon: info.icon || app.icon,
          gradient: info.gradient || app.gradient,
          isProduct: !!info.isProduct,
          productIconUrl: info.productIconUrl || '',
          fallbackLetter: info.isProduct ? this.firstLetter(info.label || app.title || app.key) : '',
        };
      });
    },
    hasPositionedStatusPanel() {
      return ['status_greeting', 'status_clock', 'status_date', 'status_weather'].every((id) => !!this.iconPositions[id])
    },
    hasPositionedSearchBar() {
      return !!this.iconPositions.searchBar
    },
    searchBarEditStyle() {
      const pos = this.iconPositions.searchBar;
      if (!pos) return {};
      return {
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 60,
        width: pos.width ? `${pos.width}px` : '520px',
      };
    },
    selectionBoxStyle() {
      if (!this.isSelecting || !this.selectionStart || !this.selectionEnd) return {};
      const x1 = Math.min(this.selectionStart.x, this.selectionEnd.x);
      const y1 = Math.min(this.selectionStart.y, this.selectionEnd.y);
      const x2 = Math.max(this.selectionStart.x, this.selectionEnd.x);
      const y2 = Math.max(this.selectionStart.y, this.selectionEnd.y);
      return {
        left: `${x1}px`,
        top: `${y1}px`,
        width: `${x2 - x1}px`,
        height: `${y2 - y1}px`,
      };
    },
  },
  watch: {
    iconPositions: {
      handler() { this.saveLayout() },
      deep: true,
    },
    widgetPositions: {
      handler() { this.saveLayout() },
      deep: true,
    },
    widgets: {
      handler() {
        this.saveLayout();
        this.updateSelectedAppKeys();
      },
      deep: true,
    },
    desktopApps: {
      handler() {
        this.saveLayout();
        this.updateSelectedAppKeys();
      },
      deep: true,
    },
    productIconUrls: {
      handler() { this.saveLayout() },
      deep: true,
    },
    openWindows: {
      handler() {
        this.$nextTick(() => this.resolveAllElementOverlaps());
        this.updateSelectedAppKeys();
        this.saveOpenWindows();
      },
      deep: true,
    },
    isEditMode(val) {
      if (!val) {
        // Dọn dẹp các trang trống không sử dụng khi thoát chế độ Edit
        this.customTotalPages = 0;
        if (this.currentPage >= this.totalDesktopPages) {
          this.currentPage = Math.max(0, this.totalDesktopPages - 1);
        }
        this.saveLayout();
      }
    },
    '$route.params.appKey': {
      immediate: true,
      handler(appKey) {
        if (!appKey) return
        if (!appsRegistry[appKey]) return
        this.openAppByKey(appKey, { syncRoute: false })
      },
    },
  },
  methods: {
    getPositionPage(pos) {
      const page = pos && Number.isInteger(pos.page) ? pos.page : 0;
      return Math.max(0, page);
    },
    isPositionOnCurrentPage(pos) {
      return this.getPositionPage(pos) === this.currentPage;
    },
    // Kiểm tra xem vị trí cụ thể trên một trang có khả dụng hay không (không bị chồng lấn bởi phần tử khác)
    isPositionAvailableOnPage({ x, y, width = 72, height = 84, page = this.currentPage, ignoreIds = [] } = {}) {
      const occupied = this.getPageOccupancy(page);
      const step = this.gridSize;
      
      // Định nghĩa hàm kiểm tra hai vùng chữ nhật có đè lên nhau không
      const overlaps = (a, b) => (
        a.x < b.x + b.width + step
        && a.x + a.width + step > b.x
        && a.y < b.y + b.height + step
        && a.y + a.height + step > b.y
      );
      
      const candidate = { x, y, width, height };
      return !occupied
        .filter(entry => !ignoreIds.includes(entry.id))
        .some(entry => overlaps(entry, candidate));
    },
    setDesktopPage(page) {
      const nextPage = Math.max(0, Math.min(this.totalDesktopPages - 1, Number(page) || 0));
      this.currentPage = nextPage;
      this.selectedAppIds = new Set();
      this.$nextTick(() => this.resolveAllElementOverlaps());
    },
    getPagedPosition(position, page = this.currentPage) {
      return { ...(position || {}), page: Math.max(0, Number(page) || 0) };
    },
    firstLetter(label) {
      return String(label || '').trim().charAt(0) || '?';
    },
    handleProductIconUpload({ label, dataUrl }) {
      const appId = keyFromLabel(label);
      if (!appId || !dataUrl) return;
      
      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (UPLOAD ICON PRODUCT LÊN CLOUD BE)
        ========================================================================
        Khi cập nhật logo/icon sản phẩm:
        - Upload file ảnh lên Cloud Storage của BE nhận URL thật như đã cmt ở AppIconTile.vue.
        - Gọi API lưu đường dẫn icon sản phẩm đã cập nhật vào DB sản phẩm:
          POST https://api.dinocloud.internal/v1/products/update-icon
          Body: { productKey: appId, iconUrl: dataUrl }
        ========================================================================
      */
      this.productIconUrls = { ...this.productIconUrls, [appId]: dataUrl };
      this.saveLayout();
    },
    getCleanedIconPositions() {
      return { ...this.iconPositions };
    },
    loadLayout() {
      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (TẢI CONFIG CÁ NHÂN HÓA TỪ DB)
        ========================================================================
        Thay vì chỉ đọc dữ liệu layout từ localStorage:
        
        1. Gọi API lấy cấu hình giao diện đã lưu của tài khoản đăng nhập hiện tại từ DB:
           const response = await fetch('https://api.dinocloud.internal/v1/user/desktop-layout', {
             headers: { 'Authorization': `Bearer ${token}` }
           });
           const parsed = await response.json();
           
        2. Gán các thông tin cấu hình này vào state để hiển thị giao diện cá nhân hóa của chính User đó:
           - Vị trí icons (`parsed.iconPositions`)
           - Vị trí widgets (`parsed.widgetPositions`)
           - Danh sách Widgets nhóm (`parsed.widgets`)
           - App hiển thị ngoài desktop (`parsed.desktopApps`)
        ========================================================================
      */
      try {
        const raw = localStorage.getItem('desktop_layout');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.iconPositions) {
          this.iconPositions = parsed.iconPositions;
        }
        if (parsed.widgetPositions) this.widgetPositions = parsed.widgetPositions;
        if (parsed.widgets) {
          // ensure compatibility: normalize old widget items -> appIds
          this.widgets = parsed.widgets.map(w => {
            const base = { collapsed: false, z: w.z || 0, ...w };
            // if legacy items array of objects exists, convert to appIds
            if (Array.isArray(base.items) && base.items.length && (base.items[0] && (base.items[0].label || base.items[0].key))) {
              base.appIds = base.items.map(it => (it.key ? it.key : keyFromLabel(it.label || it)));
              delete base.items;
            }
            // ensure appIds exists
            if (!Array.isArray(base.appIds)) base.appIds = [];
            return base;
          });
        }
          if (parsed.desktopApps && Array.isArray(parsed.desktopApps)) {
            this.desktopApps = parsed.desktopApps;
          }
          if (parsed.productIconUrls && typeof parsed.productIconUrls === 'object') {
            this.productIconUrls = parsed.productIconUrls;
          }
          // sanitize: build set of appIds inside widgets
          const inGroups = new Set();
          this.widgets.forEach(w => { if (Array.isArray(w.appIds)) w.appIds.forEach(a => { if (a !== null && a !== undefined) inGroups.add(String(a)); }); });
          // sanitize desktopApps (remove entries that are null, duplicates, or inside groups)
          if (this.desktopApps && Array.isArray(this.desktopApps)) {
            const seen = new Set();
            this.desktopApps = this.desktopApps
              .filter(d => d && d.appId && !inGroups.has(String(d.appId)))
              .filter(d => {
                const key = String(d.appId);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map(d => ({
                appId: String(d.appId),
                position: this.getPagedPosition(d.position || { x: 40, y: 80 }, this.getPositionPage(d.position)),
                displayMode: d.displayMode || 'icon'
              }));
          }
          // dedupe and coerce widget appIds, remove falsy values
          this.widgets.forEach(w => {
            if (Array.isArray(w.appIds)) {
              w.appIds = Array.from(new Set(w.appIds.map(a => (a === null || a === undefined) ? null : String(a)).filter(Boolean)));
            } else {
              w.appIds = [];
            }
          });
          // convert legacy items arrays safely to appIds and merge
          this.widgets.forEach(w => {
            if (Array.isArray(w.items)) {
              const converted = w.items.map(it => {
                if (!it) return null;
                if (typeof it === 'string') return keyFromLabel(it);
                if (it.key) return String(it.key);
                if (it.label) return keyFromLabel(it.label);
                return null;
              }).filter(Boolean);
              w.appIds = Array.from(new Set([...(w.appIds || []), ...converted]));
              delete w.items;
            }
          });
      } catch (e) {
        // ignore parse errors
      }
    },
    initDefaultLabels() {
      // Ensure two default labels exist: App and Product
      const hasApp = this.widgets.find(w => w.type === 'label' && (w.content && (w.content.text === 'App' || w.id === 'label_apps')));
      const hasProduct = this.widgets.find(w => w.type === 'label' && (w.content && (w.content.text === 'Product' || w.id === 'label_products')));
      const base = [];
      if (!hasApp) base.push({ id: 'label_apps', type: 'label', content: { text: 'App' }, appIds: [] });
      if (!hasProduct) base.push({ id: 'label_products', type: 'label', content: { text: 'Product' }, appIds: [] });
      if (base.length) {
        // insert at beginning so they appear above custom labels
        this.widgets = [...base.map(b => ({ collapsed: false, z: 0, ...b })), ...this.widgets];
        // assign default positions if missing
        this.$nextTick(() => {
          base.forEach((b, idx) => {
            if (!this.widgetPositions[b.id]) {
              const x = this.snapToGrid(24);
              const y = this.snapToGrid(24 + idx * 56);
              this.widgetPositions = { ...this.widgetPositions, [b.id]: { x, y } };
            }
          });
        });
      }
      // Do NOT auto-populate default labels with selected apps.
      // Keep widgets' appIds unchanged to avoid apps being moved into groups when entering edit mode.
    },
    enterEditMode() {
      // Prevent entering edit mode only if a pointer-drag of an element is active
      if (this.draggingElement) return;
      // Load layout and create default groups but DO NOT snapshot DOM positions.
      // Preserving positions is critical: entering edit should not scatter icons.
      this.loadLayout();
      this.normalizeLayoutPositions();
      // ensure default labels/groups exist (do not auto-populate apps)
      this.initDefaultLabels();
      this.snapshotMovableElements();
      this.isEditMode = true;
      this.$nextTick(() => this.resolveAllElementOverlaps());
    },
    snapshotMovableElements() {
      const root = this.$refs.desktopMain;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const nextHtml = { ...this.elementHtml };
      const nextPositions = { ...this.iconPositions };
      const labels = ['searchBar', 'status_greeting', 'status_clock', 'status_date', 'status_weather'];

      labels.forEach((id) => {
        const el = root.querySelector(`[data-label="${id}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        clone.removeAttribute('style');
        nextHtml[id] = clone.outerHTML;
        if (!nextPositions[id]) {
          nextPositions[id] = {
            x: this.snapToGrid(rect.left - rootRect.left),
            y: this.snapToGrid(rect.top - rootRect.top),
          };
        }
        // For searchBar: capture initial rendered width if not already stored
        if (id === 'searchBar' && nextPositions[id] && !nextPositions[id].width) {
          nextPositions[id] = { ...nextPositions[id], width: this.snapToGrid(Math.ceil(rect.width)) };
        }
      });

      this.elementHtml = nextHtml;
      this.iconPositions = nextPositions;
    },
    openAppByLabel(label) {
      const key = keyFromLabel(label)
      this.openAppByKey(key, { syncRoute: true })
    },
    openSearchResult(key) {
      this.query = ''
      this.openAppByKey(key, { syncRoute: true })
    },
    openAppByKey(key, { syncRoute }) {
      // Đánh dấu app này là đã được chọn
      this.selectedAppKeys.add(key)
      // Force Vue reactivity for Set
      this.selectedAppKeys = new Set(this.selectedAppKeys)

      const existing = this.openWindows.find((w) => w.key === key)
      if (existing) {
        // when restoring, start animation from dock position
        if (existing.minimized) {
          existing.motion = { from: getDockCenterForKey(key), to: null }
        }
        existing.minimized = false
        existing.exiting = false
        this.focusWindow(key)
      } else {
        const base = getAppByKey(key)
        if (!base) return

        this.zCounter += 1
        const vw = window.innerWidth
        const vh = window.innerHeight
        const w = Math.min(920, vw - 32)
        const h = Math.min(580, vh - 96)
        
        let x = 140 + (this.openWindows.length % 3) * 40
        let y = 120 + (this.openWindows.length % 3) * 32

        // Keep window fully inside screen bounds
        if (x + w > vw - 16) x = Math.max(16, vw - w - 16)
        if (y + h > vh - 16) y = Math.max(80, vh - h - 16)

        const rect = { x, y, w, h }

        const from = getDockCenterForKey(key)

        this.openWindows.push({
          ...base,
          rect,
          z: this.zCounter,
          minimized: false,
          exiting: false,
          motion: { from, to: null },
          maximized: true,
        })
        this.activeKey = key
      }

      if (syncRoute) {
        this.$router.push(`/app/${key}`).catch(() => {})
      }
    },
    focusWindow(key) {
      const w = this.openWindows.find((x) => x.key === key)
      if (!w) return
      this.zCounter += 1
      w.z = this.zCounter
      w.minimized = false
      this.activeKey = key
      this.$router.push(`/app/${key}`).catch(() => {})
    },
    minimizeWindow(key) {
      const w = this.openWindows.find((x) => x.key === key)
      if (!w) return

      // animate window "into" the dock icon
      const to = getDockCenterForKey(key)
      w.motion = { from: null, to }
      w.exiting = true

      window.setTimeout(() => {
        // complete minimize
        w.minimized = true
        w.exiting = false
      }, 220)

      if (this.activeKey === key) {
        const next = this.openWindows.find((x) => !x.minimized && x.key !== key)
        this.activeKey = next ? next.key : ''
        this.$router.push(this.activeKey ? `/app/${this.activeKey}` : '/').catch(() => {})
      }
    },
    closeWindow(key) {
      const idx = this.openWindows.findIndex((x) => x.key === key)
      if (idx === -1) return
      const closingWasActive = this.activeKey === key
      this.openWindows.splice(idx, 1)

      if (closingWasActive) {
        const next = this.openWindows.find((x) => !x.minimized) || this.openWindows[0]
        this.activeKey = next ? next.key : ''
        this.$router.push(this.activeKey ? `/app/${this.activeKey}` : '/').catch(() => {})
      }
    },
    moveWindow(key, { x, y, w, h }) {
      const win = this.openWindows.find((t) => t.key === key)
      if (!win) return
      const nextRect = { ...win.rect, x, y }
      if (typeof w === 'number') nextRect.w = w
      if (typeof h === 'number') nextRect.h = h
      win.rect = nextRect
    },
    toggleMaximizeWindow(key) {
      const w = this.openWindows.find((x) => x.key === key)
      if (!w) return
      w.maximized = !w.maximized
      this.focusWindow(key)
    },
    activateFromDock(key) {
      const w = this.openWindows.find((x) => x.key === key)
      if (!w) return

      if (this.activeKey === key && !w.minimized) {
        this.minimizeWindow(key)
      } else {
        this.focusWindow(key)
      }
    },
    handleAppToggleMode(appId) {
      if (!appId) return;
      const key = keyFromLabel(appId);
      const app = this.desktopApps.find(a => a.appId === key);
      if (app) {
        app.displayMode = app.displayMode === 'widget' ? 'icon' : 'widget';
        this.desktopApps = [...this.desktopApps];
        this.saveLayout();
        this.$nextTick(() => {
          this.resolveAllElementOverlaps(key);
        });
      }
    },
    removeAppFromSection({ label }) {
      const key = keyFromLabel(label)
      this.selectedAppKeys.delete(key)
      // Buộc Vue cập nhật vì Set không phản ứng tự động hoàn toàn trong một số trường hợp
      this.selectedAppKeys = new Set(this.selectedAppKeys)
      // Also remove from desktopApps and any group containers
      try {
        this.desktopApps = (this.desktopApps || []).filter(d => d.appId !== key);
        this.widgets.forEach(w => { if (Array.isArray(w.appIds)) w.appIds = w.appIds.filter(a => a !== key); });
        const p = { ...this.iconPositions }
        if (p[label] !== undefined) {
          delete p[label]
          this.iconPositions = p
        }
      } catch (e) { void e; }
    },
    reorderAppsInSection({ sectionTitle, fromLabel, toLabel }) {
      const section = this.sections.find(s => s.title === sectionTitle || (sectionTitle === 'App' && s.title === 'Apps') || (sectionTitle === 'Product' && s.title === 'Product'));
      if (section) {
        const fromIndex = section.items.findIndex(i => i.label === fromLabel);
        const toIndex = section.items.findIndex(i => i.label === toLabel);
        
        if (fromIndex !== -1 && toIndex !== -1) {
          const newItems = [...section.items];
          const [movedItem] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, movedItem);
          section.items = newItems;
        }
      }
    },
    legacyHandleDrop(event) {
      // Lấy appKey từ drag event / Get appKey from drag event
      const appKey = event.dataTransfer.getData('application/x-app-key');
      if (appKey) {
        // Thêm app vào Main UI / Add app to Main UI
        this.selectedAppKeys.add(appKey);
        // Buộc Vue cập nhật Set / Force Vue reactivity for Set
        this.selectedAppKeys = new Set(this.selectedAppKeys);
      }
    },

    handleDrop(event) {
      event.preventDefault();
      const label = event.dataTransfer.getData('application/x-app-key')
        || event.dataTransfer.getData('application/x-app-label')
        || event.dataTransfer.getData('text/plain')
        || (window.__dino_drag_payload && window.__dino_drag_payload.label);
      if (!label) return;

      const desktop = this.$refs.desktopMain;
      if (!desktop) return;
      const rect = desktop.getBoundingClientRect();
      const appId = keyFromLabel(label);
      const x = this.clampToGridRange(event.clientX - rect.left, this.getSideDockMinX(desktop), rect.width - 48);
      const y = this.clampToGrid(event.clientY - rect.top, this.getElementMaxY(desktop, 72));

      this.placeAppOnDesktop(appId, { x, y });
    },

    // Dragstart initiated from edit overlay icons
    handleDesktopDragStart(event) {
      const target = event.target ? event.target.closest('[data-label]') : null;
      const label = target ? target.getAttribute('data-label') : (event.dataTransfer.getData('application/x-app-label') || event.dataTransfer.getData('text/plain'));
      this.dragPayload = { label };
      try {
        window.__dino_drag_payload = { label };
      } catch (e) {
        // ignore
      }
      if (label) {
        const appId = keyFromLabel(label);
        this.draggedAppId = appId;
        this.dragStartPositions = {};
        (this.desktopApps || []).forEach(d => {
          if (d.position) {
            this.dragStartPositions[d.appId] = { ...d.position };
          }
        });
        if (this.selectedAppIds && this.selectedAppIds.has(appId)) {
          window.__dino_drag_selected_apps = Array.from(this.selectedAppIds);
        } else {
          window.__dino_drag_selected_apps = null;
        }
      } else {
        this.draggedAppId = null;
        window.__dino_drag_selected_apps = null;
      }
    },

    handleDesktopDrop(event) {
      const label = event.dataTransfer.getData('application/x-app-label') || event.dataTransfer.getData('text/plain') || (this.dragPayload && this.dragPayload.label) || (window.__dino_drag_payload && window.__dino_drag_payload.label);
      if (!label) return;
      // Calculate position relative to overlay container and snap to grid
      const overlay = this.$refs.editOverlay;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      const relX = event.clientX - rect.left;
      const relY = event.clientY - rect.top;
      const x = this.clampToGridRange(relX, this.getSideDockMinX(overlay), rect.width - 48);
      const y = this.clampToGrid(relY, this.getElementMaxY(overlay, 72));
      const appId = keyFromLabel(label);

      // Check if dragging multiple apps
      const appsToMove = (window.__dino_drag_selected_apps && window.__dino_drag_selected_apps.includes(appId))
        ? window.__dino_drag_selected_apps
        : [appId];

      if (appsToMove.length > 1) {
        // Find original position of the primary dragged app
        const existingDragged = (this.desktopApps || []).find(d => d.appId === appId);
        const originalDraggedPos = existingDragged ? { ...existingDragged.position } : null;

        if (originalDraggedPos) {
          const dx = x - originalDraggedPos.x;
          const dy = y - originalDraggedPos.y;

          appsToMove.forEach(aid => {
            const otherApp = (this.desktopApps || []).find(d => d.appId === aid);
            if (otherApp && otherApp.position) {
              let newX = otherApp.position.x + dx;
              let newY = otherApp.position.y + dy;
              newX = this.clampToGridRange(newX, this.getSideDockMinX(overlay), rect.width - 48);
              newY = this.clampToGrid(newY, this.getElementMaxY(overlay, 72));
              otherApp.position = { x: newX, y: newY };
            }
          });

          // Trigger update & layout save with deduplication
          const seen = new Set();
          this.desktopApps = (this.desktopApps || []).filter(d => {
            if (!d || !d.appId) return false;
            if (seen.has(d.appId)) return false;
            seen.add(d.appId);
            return true;
          });
          this.saveLayout();
          
          // Resolve overlaps
          appsToMove.forEach(aid => {
            this.resolveAllElementOverlaps(aid);
          });
        } else {
          // Fallback to single app drop
          this.placeAppOnDesktop(appId, { x, y });
        }
      } else {
        // Single app drop
        this.placeAppOnDesktop(appId, { x, y });
      }

      this.draggedAppId = null;
      window.__dino_drag_selected_apps = null;
    },

    handleDesktopDragOver(event) {
      if (!this.draggedAppId) return;
      if (event.clientX === 0 && event.clientY === 0) return;

      const overlay = this.$refs.editOverlay;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      const relX = event.clientX - rect.left;
      const relY = event.clientY - rect.top;
      const x = this.clampToGridRange(relX, this.getSideDockMinX(overlay), rect.width - 48);
      const y = this.clampToGrid(relY, this.getElementMaxY(overlay, 72));

      const appId = this.draggedAppId;
      const appsToMove = (window.__dino_drag_selected_apps && window.__dino_drag_selected_apps.includes(appId))
        ? window.__dino_drag_selected_apps
        : [appId];

      const originalDraggedPos = this.dragStartPositions[appId];
      if (!originalDraggedPos) return;

      const dx = x - originalDraggedPos.x;
      const dy = y - originalDraggedPos.y;

      let changed = false;
      this.desktopApps.forEach(d => {
        if (appsToMove.includes(d.appId)) {
          const orig = this.dragStartPositions[d.appId];
          if (orig) {
            let newX = orig.x + dx;
            let newY = orig.y + dy;
            newX = this.clampToGridRange(newX, this.getSideDockMinX(overlay), rect.width - 48);
            newY = this.clampToGrid(newY, this.getElementMaxY(overlay, 72));
            if (!d.position || d.position.x !== newX || d.position.y !== newY) {
              d.position = { x: newX, y: newY };
              changed = true;
            }
          }
        }
      });

      if (changed) {
        this.desktopApps = [...this.desktopApps];
      }
    },

    handleDesktopDragEnd() {
      if (this.draggedAppId) {
        // Revert all moved apps to their original positions
        this.desktopApps.forEach(d => {
          const orig = this.dragStartPositions[d.appId];
          if (orig) {
            d.position = { ...orig };
          }
        });
        this.desktopApps = [...this.desktopApps];
      }
      this.draggedAppId = null;
      this.dragStartPositions = {};
      window.__dino_drag_selected_apps = null;
    },
      handleBackgroundPointerDown(event) {
        if (event.button && event.button !== 0) return;

        // check if pointer starts on an interactive UI element
        const isInteractive = event.target.closest('[data-label], [data-widget-id], .pointer-events-auto, button, input, a, [data-side-dock]');
        if (isInteractive) return;

        this.isSelecting = true;
        const container = this.$refs.desktopMain;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;

        this.selectionStart = { x: startX, y: startY };
        this.selectionEnd = { x: startX, y: startY };
        this.selectedAppIds = new Set();

        const onPointerMove = (moveEvent) => {
          if (!this.isSelecting) return;
          const curX = moveEvent.clientX - rect.left;
          const curY = moveEvent.clientY - rect.top;
          this.selectionEnd = { x: curX, y: curY };

          const x1 = Math.min(this.selectionStart.x, this.selectionEnd.x);
          const y1 = Math.min(this.selectionStart.y, this.selectionEnd.y);
          const x2 = Math.max(this.selectionStart.x, this.selectionEnd.x);
          const y2 = Math.max(this.selectionStart.y, this.selectionEnd.y);

          const nextSelected = new Set();
          (this.desktopIcons || []).forEach(d => {
            if (!d.position) return;
            const iconLeft = d.position.x;
            const iconTop = d.position.y;
            const iconRight = d.position.x + 60;
            const iconBottom = d.position.y + 72;

            if (iconLeft < x2 && iconRight > x1 && iconTop < y2 && iconBottom > y1) {
              nextSelected.add(d.appId);
            }
          });
          this.selectedAppIds = nextSelected;
        };

        const onPointerUp = () => {
          this.isSelecting = false;
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);

          if (this.selectedAppIds.size > 1) {
            this.enterEditMode();
          } else {
            this.selectedAppIds = new Set();
          }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp);
      },
      placeAppOnDesktop(appId, position) {
        if (!appId) return;

        this.widgets.forEach(w => {
          if (!Array.isArray(w.appIds)) return;
          w.appIds = w.appIds.filter(a => a !== appId);
        });

        // Deduplicate desktopApps first
        const seen = new Set();
        let filtered = (this.desktopApps || []).filter(d => {
          if (!d || !d.appId) return false;
          if (seen.has(d.appId)) return false;
          seen.add(d.appId);
          return true;
        });

        const requestedPosition = this.getPagedPosition(position, this.getPositionPage(position));
        const size = this.getApproxElementSize('icon');
        let finalPosition = requestedPosition;
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || !this.isPositionAvailableOnPage({
          ...requestedPosition,
          width: size.width,
          height: size.height,
          ignoreIds: [appId],
        })) {
          finalPosition = this.findFreePositionOnPage({ width: size.width, height: size.height, startPage: this.currentPage });
        }
        this.currentPage = this.getPositionPage(finalPosition);

        const existing = filtered.find(d => d.appId === appId);
        if (existing) {
          existing.position = finalPosition;
          this.desktopApps = filtered;
        } else {
          this.desktopApps = [...filtered, { appId, position: finalPosition }];
        }

        this.selectedAppKeys.add(appId);
        this.selectedAppKeys = new Set(this.selectedAppKeys);
        this.dragPayload = null;
        this.saveLayout();
        this.$nextTick(() => this.resolveAllElementOverlaps(appId));
      },
      handleGroupDrop(groupId, event) {
        const label = event.dataTransfer.getData('application/x-app-label') || event.dataTransfer.getData('application/x-app-key') || event.dataTransfer.getData('text/plain') || (window.__dino_drag_payload && window.__dino_drag_payload.label);
        if (!label) return;
        // delegate to widget drop handler with resolved appId
        const appId = keyFromLabel(label);
        this.handleWidgetDrop({ id: groupId, appId });
      },
      onWallpaperFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (LƯU HÌNH NỀN WALLPAPER LÊN CLOUD BE)
        ========================================================================
        1. Khởi tạo FormData đưa file ảnh wallpaper vào.
        2. Gửi request POST lên Cloud Storage của BE để lưu file ảnh:
           const response = await fetch('https://api.dinocloud.internal/v1/storage/upload', { ... });
           const data = await response.json(); // Nhận về data.url là URL của ảnh
        
        3. Lưu URL hình nền mới này vào cấu hình cá nhân hóa trong DB:
           await fetch('https://api.dinocloud.internal/v1/user/config/wallpaper', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ wallpaperUrl: data.url })
           });
        ========================================================================
      */
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        this.currentWallpaper = url;
        localStorage.setItem('desktop_wallpaper', url);
      };
      reader.readAsDataURL(file);
    },
    onEditOverlayClick(event) {
        // Chỉ đóng khi click trực tiếp vào background overlay, không click vào con của nó
        if (event.target === event.currentTarget) {
          this.isEditMode = false;
          this.selectedAppIds = new Set();
        }
      },
      addNewPage() {
        // Thêm trang trống thủ công trong chế độ Edit
        this.customTotalPages = this.totalDesktopPages + 1;
        this.currentPage = this.customTotalPages - 1;
        this.saveLayout();
      },
      // Pointer drag support for positioned (non-app) elements and widgets
      startPointerDrag(id, event) {
        if (!this.isEditMode) return;
        // stop if right click
        if (event.button && event.button !== 0) return;
        
        let edgeTimer = null; // Bộ hẹn giờ chuyển trang khi giữ chuột sát mép
        let lastEdgeAction = 0; // Thời gian cuối cùng thực hiện chuyển trang sát mép
        
         this.draggingElement = id;
         if (this.widgetOriginalY && this.widgetOriginalY[id] !== undefined) {
           delete this.widgetOriginalY[id];
         }
         const overlay = this.$refs.editOverlay || this.$refs.desktopMain;
        if (!overlay) return;
        const overlayRect = overlay.getBoundingClientRect();
        const minX = this.getSideDockMinX(overlay);
        const desktopApp = (this.desktopApps || []).find(d => d.appId === id);
        const isDesktopApp = !!desktopApp;
        const appsToMove = isDesktopApp && this.selectedAppIds && this.selectedAppIds.has(id)
          ? Array.from(this.selectedAppIds)
          : [id];
        const originalAppPositions = {};
        if (isDesktopApp) {
          (this.desktopApps || []).forEach(d => {
            if (appsToMove.includes(d.appId) && d.position) {
              originalAppPositions[d.appId] = { ...d.position };
            }
          });
          try {
            window.__dino_drag_payload = { label: id };
            window.__dino_drag_selected_apps = appsToMove.length > 1 ? [...appsToMove] : null;
          } catch (e) { void e; }
        }
        const basePos = (desktopApp ? desktopApp.position : null) || this.iconPositions[id] || this.widgetPositions[id] || null;
        // find child element to apply transform for smooth dragging
        let childEl = overlay.querySelector(`[data-app-id="${id}"]`) || overlay.querySelector(`[data-label="${id}"]`) || overlay.querySelector(`[data-widget-id="${id}"]`);
        const startClientX = event.clientX || (event.touches && event.touches[0].clientX);
        const startClientY = event.clientY || (event.touches && event.touches[0].clientY);
        const baseX = basePos ? basePos.x : (childEl ? Math.round(childEl.getBoundingClientRect().left - overlayRect.left) : 0);
        const baseY = basePos ? basePos.y : (childEl ? Math.round(childEl.getBoundingClientRect().top - overlayRect.top) : 0);

        // pointer capture: prefer capturing on the element we will transform (childEl),
        // fall back to the original event.target if needed. Store so we can release later.
        let capturedEl = null;
        let capturedPointerId = null;
        const captureTarget = (childEl && childEl.setPointerCapture) ? childEl : (event && event.target && event.target.setPointerCapture ? event.target : null);
        if (captureTarget && event && event.pointerId) {
          capturedEl = captureTarget;
          capturedPointerId = event.pointerId;
          try { capturedEl.setPointerCapture(capturedPointerId); } catch (e) { /* ignore */ }
        }

        // Ensure any previous drag is cleaned up (defensive)
        if (this.dragCleanup) {
            try { this.dragCleanup(); } catch (e) { void e; }
            this.dragCleanup = null;
          }

        if (childEl && !isDesktopApp) {
          childEl.style.willChange = 'transform';
          childEl.style.transition = 'transform 0s';
        }

        let tx = 0, ty = 0;
        let rafId = null;
        let lastClientX = startClientX, lastClientY = startClientY;

        const paint = () => {
          if (isDesktopApp) {
            this.desktopApps = (this.desktopApps || []).map(d => {
              const originalPos = originalAppPositions[d.appId];
              if (originalPos) {
                const nextX = Math.max(minX, Math.min(overlayRect.width - 48, originalPos.x + tx));
                const nextY = Math.max(0, Math.min(this.getElementMaxY(overlay, 48), originalPos.y + ty));
                return { ...d, position: { ...d.position, x: Math.round(nextX), y: Math.round(nextY), page: this.getPositionPage(d.position) } };
              }
              return d;
            });
          } else if (childEl) {
            childEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          }
          rafId = null;
        };

        const onMove = (ev) => {
          const cx = ev.clientX || (ev.touches && ev.touches[0].clientX);
          const cy = ev.clientY || (ev.touches && ev.touches[0].clientY);
          if (cx == null || cy == null) return;
          lastClientX = cx; lastClientY = cy;

          // Drag-to-Edge: Tự động chuyển trang khi kéo sát viền trái/phải màn hình
          const now = Date.now();
          const isNearLeft = cx < 80;
          const isNearRight = cx > window.innerWidth - 80;

          if ((isNearLeft && this.currentPage > 0) || isNearRight) {
            if (!edgeTimer && now - lastEdgeAction > 1000) {
              edgeTimer = window.setTimeout(() => {
                let targetPage = this.currentPage;
                if (isNearLeft && this.currentPage > 0) {
                  targetPage = this.currentPage - 1;
                } else if (isNearRight) {
                  if (this.currentPage >= this.totalDesktopPages - 1) {
                    // Tự động tạo trang trống mới khi kéo sát mép phải ở trang cuối cùng
                    this.customTotalPages = this.totalDesktopPages + 1;
                  }
                  targetPage = this.currentPage + 1;
                }

                if (targetPage !== this.currentPage) {
                  const targetElementId = id;
                  
                  // Cập nhật page cho phần tử/nhóm phần tử đang kéo để nó thuộc về trang mới
                  if (isDesktopApp) {
                    this.desktopApps = (this.desktopApps || []).map(d => {
                      if (appsToMove.includes(d.appId)) {
                        return { ...d, position: { ...d.position, page: targetPage } };
                      }
                      return d;
                    });
                    appsToMove.forEach(aid => {
                      if (originalAppPositions[aid]) {
                        originalAppPositions[aid].page = targetPage;
                      }
                    });
                  } else if (this.widgetPositions[targetElementId] !== undefined) {
                    this.widgetPositions = {
                      ...this.widgetPositions,
                      [targetElementId]: { ...this.widgetPositions[targetElementId], page: targetPage }
                    };
                  } else if (this.iconPositions[targetElementId] !== undefined) {
                    this.iconPositions = {
                      ...this.iconPositions,
                      [targetElementId]: { ...this.iconPositions[targetElementId], page: targetPage }
                    };
                  }

                  // Thực hiện chuyển trang và gán thời điểm tác vụ
                  this.currentPage = targetPage;
                  lastEdgeAction = Date.now();
                  edgeTimer = null;

                  // Tính toán lại va chạm để cập nhật mượt mà trên trang mới
                  this.$nextTick(() => {
                    this.resolveAllElementOverlaps(id);
                  });
                }
              }, 800);
            }
          } else {
            if (edgeTimer) {
              window.clearTimeout(edgeTimer);
              edgeTimer = null;
            }
          }

          let elHeight = 48;
          if (childEl) {
            elHeight = childEl.getBoundingClientRect().height;
          } else if (this.widgetRects[id]) {
            elHeight = this.widgetRects[id].height;
          }

          const maxAllowedY = this.getElementMaxY(overlay, elHeight, { id });

          const nextX = Math.max(minX, Math.min(overlayRect.width - 48, baseX + cx - startClientX));
          const nextY = Math.max(0, Math.min(maxAllowedY, baseY + cy - startClientY));

          tx = nextX - baseX;
          ty = nextY - baseY;
          if (!rafId) rafId = window.requestAnimationFrame(paint);
        };

        const onUp = () => {
          // cleanup will be handled by the shared cleanup function
          if (this.dragCleanup) {
            try { this.dragCleanup(); } catch (e) { void e; }
            this.dragCleanup = null;
          }
          // compute final position using lastClientX/lastClientY
          let finalX = baseX + (lastClientX - startClientX);
          let finalY = baseY + (lastClientY - startClientY);

          let elHeight = 48;
          if (childEl) {
            elHeight = childEl.getBoundingClientRect().height;
          } else if (this.widgetRects[id]) {
            elHeight = this.widgetRects[id].height;
          }

          const maxAllowedY = this.getElementMaxY(overlay, elHeight, { id });

          const targetWidget = isDesktopApp && typeof document !== 'undefined'
            ? (document.elementsFromPoint(lastClientX, lastClientY)
                .map(el => el.closest ? el.closest('[data-widget-id]') : null)
                .find(Boolean) || null)
            : null;
          if (targetWidget) {
            this.handleWidgetDrop({ id: targetWidget.getAttribute('data-widget-id'), appId: id });
            this.draggingElement = null;
            this.dragStartPositions = {};
            if (isDesktopApp) {
              try {
                window.__dino_drag_payload = null;
              } catch (e) { void e; }
            }
            return;
          }

          const targetApp = isDesktopApp && typeof document !== 'undefined'
            ? (document.elementsFromPoint(lastClientX, lastClientY)
                .map(el => el.closest ? el.closest('[data-app-id]') : null)
                .map(el => el ? el.getAttribute('data-app-id') : null)
                .find(appId => appId && !appsToMove.includes(appId)) || null)
            : null;
          if (targetApp) {
            this.createGroupFromAppIds([...appsToMove, targetApp], { clientX: lastClientX, clientY: lastClientY });
            this.draggingElement = null;
            this.dragStartPositions = {};
            try {
              window.__dino_drag_payload = null;
              window.__dino_drag_selected_apps = null;
            } catch (e) { void e; }
            return;
          }

          if (this.gridEnabled) {
            finalX = this.clampToGridRange(finalX, minX, overlayRect.width - 48);
            finalY = this.clampToGridRange(finalY, 0, maxAllowedY);
          } else {
            finalX = Math.max(minX, Math.min(overlayRect.width - 48, finalX));
            finalY = Math.max(0, Math.min(maxAllowedY, finalY));
          }
          if (capturedEl && capturedPointerId && capturedEl.releasePointerCapture) {
            try { capturedEl.releasePointerCapture(capturedPointerId); } catch (e) { /* ignore */ }
          }
          if (childEl) {
            childEl.style.transform = 'translate3d(0px, 0px, 0)';
            childEl.style.transition = 'none';
          }
          if (isDesktopApp) {
            this.desktopApps = (this.desktopApps || []).map(d => {
              const originalPos = originalAppPositions[d.appId];
              if (originalPos) {
                const nextX = Math.max(minX, Math.min(overlayRect.width - 48, originalPos.x + (finalX - baseX)));
                const nextY = Math.max(0, Math.min(maxAllowedY, originalPos.y + (finalY - baseY)));
                return { ...d, position: { ...d.position, x: Math.round(nextX), y: Math.round(nextY), page: this.getPositionPage(d.position) } };
              }
              return d;
            });
          } else if (this.widgetPositions[id] !== undefined) {
            this.widgetPositions = { ...this.widgetPositions, [id]: { ...this.widgetPositions[id], x: Math.round(finalX), y: Math.round(finalY) } };
          } else {
            this.iconPositions = { ...this.iconPositions, [id]: { ...this.iconPositions[id], x: Math.round(finalX), y: Math.round(finalY) } };
          }
          this.$nextTick(() => {
            if (childEl) {
              childEl.style.transform = '';
              childEl.style.transition = '';
              childEl.style.willChange = '';
            }
            this.draggingElement = null;
            if (isDesktopApp) {
              appsToMove.forEach(appId => this.resolveAllElementOverlaps(appId));
            } else {
              this.resolveAllElementOverlaps(id);
            }
          });
          // persist immediately to localStorage to guarantee save across session
          try {
            const payload = {
              iconPositions: this.getCleanedIconPositions(),
              widgetPositions: this.widgetPositions,
              widgets: this.widgets,
              desktopApps: this.desktopApps,
              productIconUrls: this.productIconUrls,
            };
            localStorage.setItem('desktop_layout', JSON.stringify(payload));
          } catch (e) { void e; }
          this.saveLayout();
          if (isDesktopApp) {
            try {
              window.__dino_drag_payload = null;
              window.__dino_drag_selected_apps = null;
            } catch (e) { void e; }
          }
        };

        // shared cleanup function to remove listeners, cancel RAF, and release capture
        this.dragCleanup = () => {
          // Dọn dẹp bộ hẹn giờ sát mép khi kết thúc thao tác kéo
          if (edgeTimer) {
            window.clearTimeout(edgeTimer);
            edgeTimer = null;
          }
          try { window.removeEventListener('pointermove', onMove); } catch (e) { void e; }
          try { window.removeEventListener('pointerup', onUp); } catch (e) { void e; }
          try { window.removeEventListener('pointercancel', onUp); } catch (e) { void e; }
          try { window.removeEventListener('touchmove', onMove); } catch (e) { void e; }
          try { window.removeEventListener('touchend', onUp); } catch (e) { void e; }
          try { window.removeEventListener('touchcancel', onUp); } catch (e) { void e; }
          try { window.removeEventListener('mouseup', onUp); } catch (e) { void e; }
          if (rafId) {
            try { window.cancelAnimationFrame(rafId); } catch (e) { void e; }
            rafId = null;
          }
          if (capturedEl && capturedPointerId && capturedEl.releasePointerCapture) {
            try { capturedEl.releasePointerCapture(capturedPointerId); } catch (e) { void e; }
          }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        // touch fallback
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
        window.addEventListener('touchcancel', onUp);
        // mouse fallback
        window.addEventListener('mouseup', onUp);
      },
      startSearchBarResize(event) {
        if (!this.isEditMode) return;
        event.preventDefault();
        const startX = event.clientX;
        const pos = this.iconPositions.searchBar;
        if (!pos) return;
        const startWidth = pos.width || 520;
        const minWidth = 200;
        const maxWidth = window.innerWidth - 120;

        const onMove = (e) => {
          const dx = e.clientX - startX;
          const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx));
          const snapped = Math.round(newWidth / this.gridSize) * this.gridSize;
          this.iconPositions = {
            ...this.iconPositions,
            searchBar: { ...this.iconPositions.searchBar, width: snapped },
          };
        };

        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          this.saveLayout();
          this.$nextTick(() => this.resolveAllElementOverlaps('searchBar'));
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp);
      },
      startElementLongPress(id, event) {
        // begin a long-press; after 800ms enter edit mode and start dragging that element
        // ensure any active drag is cleaned up before starting a new long-press
        if (this.dragCleanup) {
          try { this.dragCleanup(); } catch (e) { void e; }
          this.dragCleanup = null;
        }
        this.cancelElementLongPress();
        this.elementLongPressEvent = event;
        this.elementLongPressId = id;
        if (this.isEditMode) {
          this.startPointerDrag(id, event);
          return;
        }
        this.elementLongPressTimer = window.setTimeout(() => {
          this.enterEditMode();
          this.$nextTick(() => {
            // start dragging the element using recorded event
            this.startPointerDrag(id, this.elementLongPressEvent);
          });
          this.elementLongPressTimer = null;
        }, 800);
      },
      cancelElementLongPress() {
        if (this.elementLongPressTimer) {
          clearTimeout(this.elementLongPressTimer);
          this.elementLongPressTimer = null;
        }
        this.elementLongPressEvent = null;
        this.elementLongPressId = null;
      },
      posStyle(pos) {
        if (!pos) return {};
        return {
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 60,
        }
      },
      mainElementStyle(id) {
        const pos = this.iconPositions[id];
        if (!pos) return {};
        const style = {
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        };
        if (id === 'searchBar' && pos.width) {
          style.width = `${pos.width}px`;
        }
        return style;
      },
      snapToGrid(value) {
        if (!this.gridEnabled) return Math.round(value);
        return Math.round(Number(value || 0) / this.gridSize) * this.gridSize;
      },
      clampToGrid(value, max) {
        const snappedMax = Math.floor(Math.max(0, max) / this.gridSize) * this.gridSize;
        return Math.max(0, Math.min(snappedMax, this.snapToGrid(value)));
      },
      clampToGridRange(value, min, max) {
        const snappedMin = Math.ceil(Math.max(0, min) / this.gridSize) * this.gridSize;
        const snappedMax = Math.floor(Math.max(snappedMin, max) / this.gridSize) * this.gridSize;
        return Math.max(snappedMin, Math.min(snappedMax, this.snapToGrid(value)));
      },
      getElementBottomPadding(id) {
        const widgetRect = id ? this.widgetRects[id] : null;
        return widgetRect && widgetRect.collapsed ? 96 : 72;
      },
      getElementMaxY(root, elementHeight, options = {}) {
        if (!root) return 0;
        const rootRect = root.getBoundingClientRect();
        const height = Math.max(0, Number(elementHeight || 48));
        const padding = this.getElementBottomPadding(options.id);
        let bottomLimit = rootRect.height;

        const desktop = this.$refs.desktopMain;
        const dock = (root.querySelector && root.querySelector('[data-side-dock]')) || (desktop && desktop.querySelector('[data-side-dock]'));
        if (dock) {
          const dockRect = dock.getBoundingClientRect();
          const isBottomDock = dockRect.width > dockRect.height;
          if (isBottomDock) {
            bottomLimit = Math.max(0, Math.round(dockRect.top - rootRect.top));
          }
        }

        return Math.max(0, bottomLimit - height - padding);
      },
      getApproxElementSize(type = 'icon') {
        if (type === 'widget') return { width: 240, height: 160 };
        if (type === 'searchBar') return { width: 520, height: 72 };
        return { width: 72, height: 84 };
      },
      getPageOccupancy(page) {
        const entries = [];
        const push = (pos, width, height, id) => {
          if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
          if (this.getPositionPage(pos) !== page) return;
          entries.push({ id, x: pos.x, y: pos.y, width, height });
        };

        (this.desktopApps || []).forEach(app => {
          const size = this.getApproxElementSize(app.displayMode === 'widget' ? 'widget' : 'icon');
          push(app.position, size.width, size.height, app.appId);
        });
        (this.widgets || []).forEach(widget => {
          const rect = this.widgetRects[widget.id];
          const size = rect || this.getApproxElementSize('widget');
          push(this.widgetPositions[widget.id], size.width, size.height, widget.id);
        });
        Object.entries(this.iconPositions || {}).forEach(([id, pos]) => {
          const size = this.getApproxElementSize(id === 'searchBar' ? 'searchBar' : 'icon');
          push(pos, pos.width || size.width, size.height, id);
        });

        return entries;
      },
      findFreePositionOnPage({ width = 72, height = 84, startPage = this.currentPage } = {}) {
        const root = this.$refs.editOverlay || this.$refs.desktopMain;
        if (!root) return { x: this.snapToGrid(40), y: this.snapToGrid(80), page: startPage };
        const rect = root.getBoundingClientRect();
        const step = this.gridSize;
        const minX = this.getSideDockMinX(root);
        const maxX = Math.max(minX, rect.width - width - step);

        const overlaps = (a, b) => (
          a.x < b.x + b.width + step
          && a.x + a.width + step > b.x
          && a.y < b.y + b.height + step
          && a.y + a.height + step > b.y
        );

        for (let page = Math.max(0, startPage); page < startPage + 20; page += 1) {
          const occupied = this.getPageOccupancy(page);
          const maxY = this.getElementMaxY(root, height);
          for (let y = this.snapToGrid(80); y <= maxY; y += step) {
            for (let x = this.snapToGrid(minX + step); x <= maxX; x += step) {
              const candidate = { x, y, width, height };
              if (!occupied.some(entry => overlaps(entry, candidate))) {
                return { x, y, page };
              }
            }
          }
        }

        return { x: this.snapToGrid(minX + step), y: this.snapToGrid(80), page: startPage + 1 };
      },
      getSideDockMinX(root) {
        const desktop = this.$refs.desktopMain;
        const dock = desktop && desktop.querySelector('[data-side-dock]');

        if (!root || !dock) {
          return window.innerWidth >= 1024 ? 96 : 0;
        }

        const rootRect = root.getBoundingClientRect();
        const dockRect = dock.getBoundingClientRect();
        const isSideDock = dockRect.height >= dockRect.width;
        if (!isSideDock) return 0;

        return this.snapToGrid(dockRect.right - rootRect.left + this.gridSize);
      },
      normalizeLayoutPositions() {
        const normalizeMap = (positions) => {
          const next = {};
          Object.entries(positions || {}).forEach(([key, pos]) => {
            if (!pos || typeof pos.x !== 'number') return;
            const normalized = { ...pos, x: this.snapToGrid(pos.x), page: this.getPositionPage(pos) };
            if (typeof pos.y === 'number') normalized.y = this.snapToGrid(pos.y);
            if (typeof pos.bottom === 'number') normalized.bottom = this.snapToGrid(pos.bottom);
            next[key] = normalized;
          });
          return next;
        };

        this.iconPositions = normalizeMap(this.iconPositions);
        this.widgetPositions = normalizeMap(this.widgetPositions);
        this.desktopApps = (this.desktopApps || []).map((app) => ({
          ...app,
          position: app.position ? {
            ...app.position,
            x: this.snapToGrid(app.position.x),
            page: this.getPositionPage(app.position),
            ...(typeof app.position.y === 'number' ? { y: this.snapToGrid(app.position.y) } : {}),
          } : app.position,
        }));
      },
      promptAddLabel() {
          this.newLabelText = 'New Label';
          this.showAddLabelDialog = true;
          this.$nextTick(() => {
            try { if (this.$refs.addLabelInput) this.$refs.addLabelInput.focus(); } catch (e) { /* ignore */ }
          });
      },
        confirmAddLabel() {
          const text = (this.newLabelText || '').trim();
          this.showAddLabelDialog = false;
          if (text) {
            this.addWidget('label', text);
          }
          this.newLabelText = '';
        },
        cancelAddLabel() {
          this.showAddLabelDialog = false;
          this.newLabelText = '';
        },
      openRenameGroupDialog({ id, text }) {
        if (id === 'label_apps' || id === 'label_products') return;
        this.renameGroupId = id;
        this.renameGroupText = text || '';
        this.showRenameGroupDialog = true;
        this.$nextTick(() => {
          try {
            if (this.$refs.renameGroupInput) {
              this.$refs.renameGroupInput.focus();
              this.$refs.renameGroupInput.select();
            }
          } catch (e) { void e; }
        });
      },
      confirmRenameGroup() {
        const id = this.renameGroupId;
        const text = String(this.renameGroupText || '').trim();
        this.showRenameGroupDialog = false;
        this.renameGroupId = '';
        this.renameGroupText = '';
        if (!id || !text || id === 'label_apps' || id === 'label_products') return;
        this.updateWidgetContent({ id, content: { text } });
      },
      cancelRenameGroup() {
        this.showRenameGroupDialog = false;
        this.renameGroupId = '';
        this.renameGroupText = '';
      },
      addWidget(type, labelText = '') {
        const id = `w_${Date.now()}`;
        const item = { id, type, content: { text: labelText || (type === 'label' ? 'New Label' : '') } };
        // insert at end so display order is top->down
        this.widgets.push(item);
        // place new label top-to-bottom: compute a y based on existing label count
        this.$nextTick(() => {
          const size = this.getApproxElementSize('widget');
          const pos = this.findFreePositionOnPage({ width: size.width, height: size.height, startPage: this.currentPage });
          this.currentPage = pos.page;
          this.widgetPositions = { ...this.widgetPositions, [id]: pos };
        });
      },
      getNextGroupName() {
        const existingNames = new Set((this.widgets || [])
          .map(w => String((w.content && (w.content.text || w.content.label)) || '').trim().toLowerCase())
          .filter(Boolean));
        if (!existingNames.has('group')) return 'group';
        let index = 1;
        while (existingNames.has(`group(${index})`)) {
          index += 1;
        }
        return `group(${index})`;
      },
      createGroupFromAppIds(appIds, { clientX, clientY } = {}) {
        const uniqueAppIds = Array.from(new Set((appIds || []).filter(Boolean)));
        if (uniqueAppIds.length < 2) return;

        this.desktopApps = (this.desktopApps || []).filter(d => !uniqueAppIds.includes(d.appId));
        this.widgets.forEach(w => {
          if (!Array.isArray(w.appIds)) return;
          w.appIds = w.appIds.filter(a => !uniqueAppIds.includes(a));
        });

        const id = `w_${Date.now()}`;
        const newWidget = {
          id,
          type: 'label',
          content: { text: this.getNextGroupName() },
          appIds: uniqueAppIds,
          collapsed: false,
          z: this.zCounter,
        };

        const overlay = this.$refs.editOverlay || this.$refs.desktopMain;
        let x = this.snapToGrid(40);
        let y = this.snapToGrid(80);
        let page = this.currentPage;
        if (overlay && typeof clientX === 'number' && typeof clientY === 'number') {
          const rect = overlay.getBoundingClientRect();
          x = this.clampToGridRange(clientX - rect.left - 40, this.getSideDockMinX(overlay), rect.width - 200);
          y = this.clampToGrid(clientY - rect.top - 24, this.getElementMaxY(overlay, 120, { id }));
        } else {
          const pos = this.findFreePositionOnPage({ width: 240, height: 160, startPage: this.currentPage });
          x = pos.x;
          y = pos.y;
          page = pos.page;
        }

        this.widgets.push(newWidget);
        this.currentPage = page;
        this.widgetPositions = { ...this.widgetPositions, [id]: { x, y, page } };
        this.selectedAppIds = new Set();
        this.saveLayout();
        this.$nextTick(() => {
          this.collectWidgetRects();
          this.resolveAllElementOverlaps(id);
        });
      },
      saveLayout() {
        /*
          ========================================================================
          TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (LƯU CONFIG CÁ NHÂN HÓA VÀO DB)
          ========================================================================
          Mỗi khi người dùng di chuyển icon, thay đổi kích thước searchBar, thêm bớt widgets,
          hoặc upload logo, thay vì chỉ lưu local, ta sẽ đồng bộ lên DB qua API cá nhân hóa:
          
          await fetch('https://api.dinocloud.internal/v1/user/desktop-layout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
          });
          ========================================================================
        */
        try {
          const payload = {
            iconPositions: this.getCleanedIconPositions(),
            widgetPositions: this.widgetPositions,
          widgets: this.widgets,
          desktopApps: this.desktopApps,
          productIconUrls: this.productIconUrls,
        };
        localStorage.setItem('desktop_layout', JSON.stringify(payload));
        } catch (e) {
          // ignore
        }
      },
      saveOpenWindows() {
        /*
          ========================================================================
          TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (LƯU TRẠNG THÁI CỬA SỔ ĐANG MỞ VÀO DB)
          ========================================================================
          Để lưu lại trạng thái phiên làm việc (các cửa sổ đang mở, kích thước, vị trí tọa độ của chúng),
          giúp người dùng đăng nhập lại trên thiết bị khác vẫn khôi phục chính xác trạng thái:
          
          await fetch('https://api.dinocloud.internal/v1/user/session-windows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(list)
          });
          ========================================================================
        */
        try {
          const list = this.openWindows.map(w => ({
            key: w.key,
            rect: w.rect,
            z: w.z,
            minimized: w.minimized,
            maximized: w.maximized,
          }));
          localStorage.setItem('desktop_open_windows', JSON.stringify(list));
        } catch (e) {
          // ignore
        }
      },
      onWidgetMeasure({ id, width, height, collapsed }) {
        this.widgetRects = {
          ...this.widgetRects,
          [id]: { width, height, collapsed },
        };
        this.$nextTick(() => {
          this.collectWidgetRects();
          this.resolveAllElementOverlaps(id);
          // Ensure the widget fits in the main viewport
          try { this.ensureWidgetFitsInView(id); } catch (e) { void e; }
        });
      },
      collectWidgetRects() {
        const root = this.isEditMode ? this.$refs.editOverlay : this.$refs.desktopMain;
        if (!root) return;
        const next = { ...this.widgetRects };
        root.querySelectorAll('[data-widget-id]').forEach((el) => {
          const id = el.getAttribute('data-widget-id');
          if (!id) return;
          const rect = el.getBoundingClientRect();
          next[id] = {
            width: Math.ceil(rect.width),
            height: Math.ceil(rect.height),
            collapsed: next[id] ? next[id].collapsed : false,
          };
        });
        this.widgetRects = next;
      },

      ensureWidgetFitsInView(id) {
        const root = this.$refs.desktopMain;
        if (!root) return;
        const el = root.querySelector(`[data-widget-id="${id}"]`);
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        let viewportBottom = rootRect.top + root.clientHeight; // visible bottom of container

        // Respect bottom dock if present
        const dockEl = root.querySelector('[data-side-dock]');
        if (dockEl) {
          const dockRect = dockEl.getBoundingClientRect();
          const isBottomDock = dockRect.width > dockRect.height;
          if (isBottomDock) {
            viewportBottom = dockRect.top;
          }
        }

        const pos = this.widgetPositions[id];
        if (!pos || typeof pos.y !== 'number') return;

        const widgetRect = this.widgetRects[id];
        const isCollapsed = widgetRect ? widgetRect.collapsed : false;
        const padding = isCollapsed ? 96 : 72; // 4 rows (96px) when collapsed, 3 rows (72px) when expanded

        let targetY = pos.y;

        if (isCollapsed) {
          // If collapsed, check if we have a stored original Y to restore
          if (this.widgetOriginalY && this.widgetOriginalY[id] !== undefined) {
            targetY = this.widgetOriginalY[id];
            delete this.widgetOriginalY[id];
          }
        }

        // Perform unified bottom boundary check
        // Using elRect.height (current actual size) or fallback to 48px
        const elHeight = elRect.height || (widgetRect ? widgetRect.height : 48);
        const predictedBottom = targetY + elHeight + rootRect.top;

        if (predictedBottom > viewportBottom - padding) {
          const overflow = predictedBottom - (viewportBottom - padding);

          // Store the original Y before pushing it up (only when expanded)
          if (!isCollapsed && this.widgetOriginalY && this.widgetOriginalY[id] === undefined) {
            this.widgetOriginalY[id] = pos.y;
          }

          targetY = targetY - overflow;
          if (targetY < 0) targetY = 0;
        }

        if (this.gridEnabled) {
          targetY = this.snapToGrid(targetY);
        }

        if (targetY !== pos.y) {
          this.widgetPositions = {
            ...this.widgetPositions,
            [id]: { ...pos, y: targetY }
          };
          this.saveLayout();
        }
      },
      resolveWidgetOverlaps(changedId) {
        this.resolveAllElementOverlaps(changedId);
      },
      resolveAllElementOverlaps(changedId) {
        if (this.draggingElement) return;
        const root = this.isEditMode ? this.$refs.editOverlay : this.$refs.desktopMain;
        if (!root) return;


        const seenApps = new Set();
        const deduplicatedDesktopApps = (this.desktopApps || []).filter(d => {
          if (!d || !d.appId) return false;
          if (seenApps.has(d.appId)) return false;
          seenApps.add(d.appId);
          return true;
        });
        const desktopAppIds = new Set(deduplicatedDesktopApps.map((app) => app.appId));
        const entries = [];
        const rootRect = root.getBoundingClientRect();

        const pushEntry = ({ id, type, pos, width, height, priority }) => {
          if (!id || !pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
          entries.push({
            id,
            type,
            x: pos.x,
            y: pos.y,
            width: Math.max(this.gridSize, this.snapToGrid(Math.ceil(width || this.gridSize))),
            height: Math.max(this.gridSize, this.snapToGrid(Math.ceil(height || this.gridSize))),
            priority,
          });
        };

        const obstacleRoot = this.$refs.desktopMain || root;
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) {
          entries.push({
            id: 'sideDock_virtual_obstacle',
            type: 'obstacle',
            x: 0,
            y: 0,
            width: this.getSideDockMinX(root),
            height: this.snapToGrid(rootRect.height),
            priority: 0,
          });
        } else {
          obstacleRoot.querySelectorAll('[data-side-dock]').forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const dockPadding = this.gridSize * 4;
            entries.push({
              id: `sideDock_${index}`,
              type: 'obstacle',
              x: this.snapToGrid(rect.left - rootRect.left - dockPadding),
              y: this.snapToGrid(rect.top - rootRect.top - dockPadding),
              width: Math.max(this.gridSize, this.snapToGrid(Math.ceil(rect.width + dockPadding * 2))),
              height: Math.max(this.gridSize, this.snapToGrid(Math.ceil(rect.height + dockPadding * 2))),
              priority: 0,
            });
          });
        }

        root.querySelectorAll('[data-widget-id]').forEach((el) => {
          const id = el.getAttribute('data-widget-id');
          const pos = this.widgetPositions[id];
          const rect = el.getBoundingClientRect();
          pushEntry({ id, type: 'widget', pos, width: rect.width, height: rect.height, priority: 10 });
        });

        root.querySelectorAll('[data-label]').forEach((el) => {
          const id = el.getAttribute('data-label');
          if (id === 'statusPanel') return;
          const rect = el.getBoundingClientRect();
          const appId = keyFromLabel(id);
          if (desktopAppIds.has(appId)) {
            const app = deduplicatedDesktopApps.find((item) => item.appId === appId);
            pushEntry({ id: appId, type: 'desktopApp', pos: app && app.position, width: rect.width, height: rect.height, priority: 30 });
            return;
          }
          if (this.iconPositions[id]) {
            pushEntry({ id, type: 'icon', pos: this.iconPositions[id], width: rect.width, height: rect.height, priority: 20 });
          }
        });

        entries.sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.priority - b.priority));

        const nextWidgetPositions = { ...this.widgetPositions };
        const nextIconPositions = { ...this.iconPositions };
        const nextDesktopApps = deduplicatedDesktopApps.map((app) => ({ ...app, position: app.position ? { ...app.position } : app.position }));
        let changed = false;

        const overlaps = (a, b) => {
          const isObstacle = a.type === 'obstacle' || b.type === 'obstacle';
          const isStatusElement = (id) => ['status_greeting', 'status_clock', 'status_date', 'status_weather'].includes(id);
          const hasStatus = isStatusElement(a.id) || isStatusElement(b.id);

          const padding = (isObstacle || hasStatus) ? 0 : this.gridSize;
          return a.x < b.x + b.width + padding
            && a.x + a.width + padding > b.x
            && a.y < b.y + b.height + padding
            && a.y + a.height + padding > b.y;
        };

        const findNearestFreePosition = (entry, placed) => {
          const maxX = Math.floor(Math.max(0, rootRect.width - entry.width) / this.gridSize) * this.gridSize;
          const maxY = Math.floor(this.getElementMaxY(root, entry.height, { id: entry.id }) / this.gridSize) * this.gridSize;
          const originX = this.clampToGrid(entry.x, maxX);
          const originY = this.clampToGrid(entry.y, maxY);

          const candidateWorks = (x, y) => {
            const candidate = { ...entry, x, y };
            return !placed.some((item) => overlaps(item, candidate));
          };

          if (candidateWorks(originX, originY)) return { x: originX, y: originY };

          const maxRadius = Math.ceil(Math.max(rootRect.width, rootRect.height) / this.gridSize);
          for (let radius = 1; radius <= maxRadius; radius += 1) {
            const candidates = [];
            for (let dx = -radius; dx <= radius; dx += 1) {
              candidates.push({ x: originX + dx * this.gridSize, y: originY - radius * this.gridSize });
              candidates.push({ x: originX + dx * this.gridSize, y: originY + radius * this.gridSize });
            }
            for (let dy = -radius + 1; dy <= radius - 1; dy += 1) {
              candidates.push({ x: originX - radius * this.gridSize, y: originY + dy * this.gridSize });
              candidates.push({ x: originX + radius * this.gridSize, y: originY + dy * this.gridSize });
            }

            candidates.sort((a, b) => {
              const da = Math.abs(a.x - originX) + Math.abs(a.y - originY);
              const db = Math.abs(b.x - originX) + Math.abs(b.y - originY);
              return da - db || a.y - b.y || a.x - b.x;
            });

            const found = candidates.find((candidate) => (
              candidate.x >= 0
              && candidate.y >= 0
              && candidate.x <= maxX
              && candidate.y <= maxY
              && candidateWorks(candidate.x, candidate.y)
            ));
            if (found) return found;
          }

          return { x: originX, y: originY };
        };

        const placed = [];
        for (let i = 0; i < entries.length; i += 1) {
          const current = entries[i];
          if (current.type === 'obstacle') {
            placed.push(current);
            continue;
          }
          const nextPos = findNearestFreePosition(current, placed);
          
          // Kiểm tra xem vị trí mới tìm được có bị chồng lấn hay không
          const isOverlapping = placed.some(item => overlaps(item, { ...current, x: nextPos.x, y: nextPos.y }));
          
          if (isOverlapping && current.type !== 'obstacle') {
            // Không tìm thấy vị trí khả dụng trên trang này -> tự động đẩy phần tử sang trang kế tiếp
            const size = { width: current.width, height: current.height };
            const freePos = this.findFreePositionOnPage({ width: size.width, height: size.height, startPage: this.currentPage + 1 });
            
            // Cập nhật tọa độ và đặt trang mới cho phần tử
            if (current.type === 'widget') {
              nextWidgetPositions[current.id] = { ...nextWidgetPositions[current.id], x: freePos.x, y: freePos.y, page: freePos.page };
            } else if (current.type === 'desktopApp') {
              const idx = nextDesktopApps.findIndex((app) => app.appId === current.id);
              if (idx !== -1) {
                nextDesktopApps[idx].position = { ...nextDesktopApps[idx].position, x: freePos.x, y: freePos.y, page: freePos.page };
              }
            } else {
              nextIconPositions[current.id] = { ...nextIconPositions[current.id], x: freePos.x, y: freePos.y, page: freePos.page };
            }
            changed = true;
            continue; // Bỏ qua không đẩy vào placed của trang hiện tại
          }

          if (nextPos.x !== current.x || nextPos.y !== current.y) {
            current.x = nextPos.x;
            current.y = nextPos.y;
            if (current.type === 'widget') {
              nextWidgetPositions[current.id] = { ...nextWidgetPositions[current.id], x: nextPos.x, y: nextPos.y };
            } else if (current.type === 'desktopApp') {
              const idx = nextDesktopApps.findIndex((app) => app.appId === current.id);
              if (idx !== -1) {
                nextDesktopApps[idx].position = { ...nextDesktopApps[idx].position, x: nextPos.x, y: nextPos.y };
              }
            } else {
              nextIconPositions[current.id] = { ...nextIconPositions[current.id], x: nextPos.x, y: nextPos.y };
            }
            changed = true;
          }
          placed.push(current);
        }

        if (changed) {
          this.widgetPositions = nextWidgetPositions;
          this.iconPositions = nextIconPositions;
          const seen = new Set();
          this.desktopApps = nextDesktopApps.filter(d => {
            if (!d || !d.appId) return false;
            if (seen.has(d.appId)) return false;
            seen.add(d.appId);
            return true;
          });
          this.saveLayout();
          if (changedId) {
            window.setTimeout(() => this.resolveAllElementOverlaps(), 80);
          }
        }
      },
      removeWidget(id) {
            // When removing a group/widget, delete its apps completely from desktop and active state
            const w = this.widgets.find(x => x.id === id);
            if (w && Array.isArray(w.appIds) && w.appIds.length) {
              w.appIds.forEach(appId => {
                // Remove from selectedAppKeys so it goes back to "More Apps" dropdown
                this.selectedAppKeys.delete(appId);
                // Remove from desktop positioned apps
                this.desktopApps = (this.desktopApps || []).filter(d => d.appId !== appId);
                // Close window if the app is currently open
                try { this.closeWindow(appId); } catch (e) { void e; }
                // Remove any custom icon positions
                const appDef = this.appsById[appId];
                if (appDef && appDef.label) {
                  const label = appDef.label;
                  const p = { ...this.iconPositions };
                  if (p[label] !== undefined) {
                    delete p[label];
                    this.iconPositions = p;
                  }
                }
              });
              this.selectedAppKeys = new Set(this.selectedAppKeys);
            }
            this.widgets = this.widgets.filter(w => w.id !== id);
            const p = { ...this.widgetPositions };
            delete p[id];
            this.widgetPositions = p;
            this.saveLayout();
      },
          removeAppFromWidget({ id, appId, label }) {
            if (!appId && label) appId = keyFromLabel(label);
            const idx = this.widgets.findIndex(w => w.id === id);
            if (idx === -1) return;
            const w = this.widgets[idx];
            if (!Array.isArray(w.appIds)) return;
            const i = w.appIds.indexOf(appId);
            if (i !== -1) {
              // Remove from group
              w.appIds.splice(i, 1);
              // Delete completely from layout (reverts to "More Apps" dropdown)
              this.selectedAppKeys.delete(appId);
              this.selectedAppKeys = new Set(this.selectedAppKeys);
              this.desktopApps = (this.desktopApps || []).filter(d => d.appId !== appId);
              try { this.closeWindow(appId); } catch (e) { void e; }

              const appDef = this.appsById[appId];
              if (appDef && appDef.label) {
                const labelName = appDef.label;
                const p = { ...this.iconPositions };
                if (p[labelName] !== undefined) {
                  delete p[labelName];
                  this.iconPositions = p;
                }
              }

              this.widgets = [...this.widgets.slice(0, idx), { ...w }, ...this.widgets.slice(idx+1)];
              this.saveLayout();
            }
          },
      handleCreateGroup({ fromLabel, toLabel, clientX, clientY }) {
          // Create a new group widget by appIds (preserve single source-of-truth)
          const from = fromLabel;
          const to = toLabel;
          if (!from || !to || from === to) return;
          const fromId = keyFromLabel(from);
          const toId = keyFromLabel(to);
          this.createGroupFromAppIds([toId, fromId], { clientX, clientY });
      },
        handleWidgetDrop({ id, appId, label, targetAppId, targetLabel, index }) {
          if (!appId && label) {
            appId = keyFromLabel(label);
          }
          if (!targetAppId && targetLabel) {
            targetAppId = keyFromLabel(targetLabel);
          }
          // id: target widget id; appId: source app id being dropped
          const idx = this.widgets.findIndex(w => w.id === id);
          if (idx === -1) return;
          const w = this.widgets[idx];
          if (!Array.isArray(w.appIds)) w.appIds = [];

          // Validation: Only allow apps in App group and products in Product group
          const isAppGroup = w.id === 'label_apps' || (w.content && (w.content.text === 'App' || w.content.label === 'App'));
          const isProductGroup = w.id === 'label_products' || (w.content && (w.content.text === 'Product' || w.content.label === 'Product'));

          // Check if dragging multiple apps
          const appsToDrop = (window.__dino_drag_selected_apps && window.__dino_drag_selected_apps.includes(appId))
            ? window.__dino_drag_selected_apps
            : [appId];

          const validApps = [];
          let hasInvalid = false;

          appsToDrop.forEach(aid => {
            if (isAppGroup) {
              const isApp = this.appSection && this.appSection.items.some(i => keyFromLabel(i.label || i.title) === aid);
              if (!isApp) {
                hasInvalid = true;
                return;
              }
            }
            if (isProductGroup) {
              const isProduct = this.productSection && this.productSection.items.some(i => keyFromLabel(i.label || i.title) === aid);
              if (!isProduct) {
                hasInvalid = true;
                return;
              }
            }
            validApps.push(aid);
          });

          if (hasInvalid) {
            this.showGroupError = true;
          }

          if (validApps.length === 0) return;

          // remove from desktopApps
          this.desktopApps = (this.desktopApps || []).filter(d => !validApps.includes(d.appId));

          // remove from other groups
          this.widgets.forEach((other) => {
            if (!Array.isArray(other.appIds)) return;
            other.appIds = other.appIds.filter(a => !validApps.includes(a));
          });

          // compute insertion index
          let insertAt = (typeof index === 'number') ? index : w.appIds.length;
          if (targetAppId) {
            const tIdx = w.appIds.indexOf(targetAppId);
            if (tIdx !== -1) insertAt = tIdx;
          }

          // avoid duplicates
          validApps.forEach(aid => {
            if (!w.appIds.includes(aid)) {
              w.appIds.splice(insertAt, 0, aid);
              insertAt++;
            }
          });

          // Clear selection on successful drop
          this.selectedAppIds = new Set();
          this.draggedAppId = null;
          window.__dino_drag_selected_apps = null;

          // KEEP selectedAppKeys unchanged: apps remain selected (visible in main UI)

          this.widgets = [...this.widgets.slice(0, idx), { ...w }, ...this.widgets.slice(idx+1)];
          this.saveLayout();
        },
      updateWidgetContent({ id, content }) {
        const idx = this.widgets.findIndex(w => w.id === id);
        if (idx === -1) return;
        const w = { ...this.widgets[idx], content: { ...this.widgets[idx].content, ...content } };
        const arr = [...this.widgets];
        arr.splice(idx, 1, w);
        this.widgets = arr;
        // persist immediately
        this.saveLayout();
      },
      updateSelectedAppKeys() {
        const keys = new Set();
        (this.desktopApps || []).forEach(d => {
          if (d && d.appId) keys.add(String(d.appId));
        });
        (this.widgets || []).forEach(w => {
          if (Array.isArray(w.appIds)) {
            w.appIds.forEach(a => {
              if (a) keys.add(String(a));
            });
          }
        });
        (this.openWindows || []).forEach(w => {
          if (w && w.key) keys.add(String(w.key));
        });
        this.selectedAppKeys = keys;
      },
  },
  mounted() {
    this.loadLayout();
    this.initDefaultLabels();
    this.updateSelectedAppKeys();
    this.$nextTick(() => this.resolveAllElementOverlaps());
  },
}
</script>
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
