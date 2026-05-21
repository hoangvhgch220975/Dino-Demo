// Central registry for apps in the "desktop OS" UI.
// Later you can replace iframeUrl with real app URLs (per-app API/FE endpoint).

/*
  ========================================================================
  TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (LẤY DANH SÁCH APP VÀ ENDPOINT TỪ BE)
  ========================================================================
  Hiện tại danh sách các Apps/Products và endpoint (iframeUrl) đang được định nghĩa tĩnh (mockdata).
  Khi tích hợp hệ thống Cloud cũ nội bộ của bạn:
  
  1. API Backend cần cung cấp endpoint trả về danh sách các app được cấu hình và phân quyền cho User:
     GET https://api.dinocloud.internal/v1/apps
     Trả về một mảng chứa thông tin: key, title, icon, gradient, và iframeUrl thật của ứng dụng đó.
     
  2. Mỗi App/Product sau này sẽ là THẬT được host độc lập (Micro-Frontends hoặc các app riêng lẻ),
     ví dụ:
     - talk: iframeUrl: "https://talk.dinocloud.internal/"
     - mail: iframeUrl: "https://mail.dinocloud.internal/"
     - dinoPay: iframeUrl: "https://pay.dinocloud.internal/"
     - dinoShop: iframeUrl: "https://shop.dinocloud.internal/"

  3. Frontend sẽ thực hiện gọi API này trong mounted() của DesktopView và map động vào registry
     thay vì dùng danh sách export tĩnh dưới đây.
  ========================================================================
*/

export const appsRegistry = {
  talk: {
    key: "talk",
    title: "Talk",
    icon: "chat",
    gradient: "from-blue-500 to-blue-700",
    iframeUrl: "about:blank",
  },
  files: {
    key: "files",
    title: "File",
    icon: "folder",
    gradient: "from-amber-400 to-amber-600",
    iframeUrl: "about:blank",
  },
  activity: {
    key: "activity",
    title: "Activity",
    icon: "analytics",
    gradient: "from-emerald-500 to-emerald-700",
    iframeUrl: "about:blank",
  },
  mail: {
    key: "mail",
    title: "Mail",
    icon: "mail",
    gradient: "from-red-500 to-red-700",
    iframeUrl: "about:blank",
  },
  contact: {
    key: "contact",
    title: "Contact",
    icon: "person",
    gradient: "from-blue-400 to-blue-600",
    iframeUrl: "about:blank",
  },
  calendar: {
    key: "calendar",
    title: "Calendar",
    icon: "calendar_today",
    gradient: "from-indigo-500 to-indigo-700",
    iframeUrl: "about:blank",
  },
  teamhub: {
    key: "teamhub",
    title: "TeamHub",
    icon: "groups",
    gradient: "from-purple-500 to-purple-700",
    iframeUrl: "about:blank",
  },
  social: {
    key: "social",
    title: "Social",
    icon: "share",
    gradient: "from-sky-400 to-sky-600",
    iframeUrl: "about:blank",
  },
  announcement: {
    key: "announcement",
    title: "Announcement",
    icon: "campaign",
    gradient: "from-orange-400 to-orange-600",
    iframeUrl: "about:blank",
  },
  notes: {
    key: "notes",
    title: "Notes",
    icon: "edit_note",
    gradient: "from-yellow-400 to-yellow-600",
    iframeUrl: "about:blank",
  },
  countdown: {
    key: "countdown",
    title: "Countdown",
    icon: "timer",
    gradient: "from-rose-500 to-rose-700",
    iframeUrl: "about:blank",
  },

  website: {
    key: "website",
    title: "Website",
    icon: "language",
    gradient: "from-cyan-500 to-blue-600",
    iframeUrl: "https://vsg.top/",
  },
  dino: {
    key: "dino",
    title: "DINO",
    icon: "memory",
    gradient: "from-slate-600 to-slate-800",
    iframeUrl: "about:blank",
  },
  ec: {
    key: "ec",
    title: "EC",
    icon: "account_balance",
    gradient: "from-emerald-600 to-teal-800",
    iframeUrl: "about:blank",
  },
  pvcfc: {
    key: "pvcfc",
    title: "PVCFC",
    icon: "corporate_fare",
    gradient: "from-blue-700 to-indigo-900",
    iframeUrl: "about:blank",
  },
  admin: {
    key: "admin",
    title: "Admin",
    icon: "admin_panel_settings",
    gradient: "from-zinc-500 to-zinc-700",
    iframeUrl: "about:blank",
  },
  photos: {
    key: "photos",
    title: "Photos",
    icon: "photo_library",
    gradient: "from-pink-500 to-rose-500",
    iframeUrl: "about:blank",
  },
  music: {
    key: "music",
    title: "Music",
    icon: "music_note",
    gradient: "from-purple-400 to-indigo-500",
    iframeUrl: "about:blank",
  },
  weather: {
    key: "weather",
    title: "Weather",
    icon: "wb_sunny",
    gradient: "from-amber-400 to-orange-500",
    iframeUrl: "about:blank",
  },
  maps: {
    key: "maps",
    title: "Maps",
    icon: "map",
    gradient: "from-teal-400 to-emerald-600",
    iframeUrl: "about:blank",
  },
  news: {
    key: "news",
    title: "News",
    icon: "newspaper",
    gradient: "from-blue-600 to-cyan-700",
    iframeUrl: "about:blank",
  },
  settings: {
    key: "settings",
    title: "Settings",
    icon: "settings",
    gradient: "from-gray-500 to-slate-700",
    iframeUrl: "about:blank",
  },
  terminal: {
    key: "terminal",
    title: "Terminal",
    icon: "terminal",
    gradient: "from-slate-800 to-black",
    iframeUrl: "about:blank",
  },
  tasks: {
    key: "tasks",
    title: "Tasks",
    icon: "task_alt",
    gradient: "from-indigo-600 to-blue-800",
    iframeUrl: "about:blank",
  },
  camera: {
    key: "camera",
    title: "Camera",
    icon: "photo_camera",
    gradient: "from-stone-500 to-neutral-700",
    iframeUrl: "about:blank",
  },
  calculator: {
    key: "calculator",
    title: "Calculator",
    icon: "calculate",
    gradient: "from-orange-500 to-red-600",
    iframeUrl: "about:blank",
  },
  dinoEdu: {
    key: "dinoEdu",
    title: "DinoEdu",
    icon: "school",
    gradient: "from-amber-500 to-yellow-600",
    iframeUrl: "about:blank",
  },
  dinoPay: {
    key: "dinoPay",
    title: "DinoPay",
    icon: "payments",
    gradient: "from-emerald-500 to-green-700",
    iframeUrl: "about:blank",
  },
  dinoShop: {
    key: "dinoShop",
    title: "DinoShop",
    icon: "shopping_cart",
    gradient: "from-rose-500 to-pink-600",
    iframeUrl: "about:blank",
  },
  dinoHealth: {
    key: "dinoHealth",
    title: "DinoHealth",
    icon: "medical_services",
    gradient: "from-red-400 to-rose-600",
    iframeUrl: "about:blank",
  },
  dinoDrive: {
    key: "dinoDrive",
    title: "DinoDrive",
    icon: "cloud_upload",
    gradient: "from-indigo-400 to-purple-600",
    iframeUrl: "about:blank",
  },
};

export const getAppByKey = (key) => appsRegistry[key];
