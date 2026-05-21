<template>
  <div :class="rootClass">
    <h2
      :class="[
        'text-white font-sans tracking-widest uppercase text-[24px] md:text-[30px] font-extrabold drop-shadow-[0_0_14px_rgba(255,255,255,0.42)] transition-all duration-300 cursor-grab active:cursor-grabbing hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.62)]',
        positioned ? 'm-0 pointer-events-auto' : 'mb-2.5',
      ]"
      :style="elementStyle('status_greeting')"
      data-label="status_greeting"
      @pointerdown.stop="$emit('element-pointerdown', 'status_greeting', $event)"
      @pointerup.stop="$emit('element-pointerup', 'status_greeting', $event)"
    >
      {{ greeting }}
    </h2>

    <div
      :class="[
        'font-sans text-white text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.45)] animate-glow select-none cursor-grab active:cursor-grabbing',
        positioned ? 'm-0 pointer-events-auto' : 'mb-2',
      ]"
      :style="elementStyle('status_clock')"
      data-label="status_clock"
      @pointerdown.stop="$emit('element-pointerdown', 'status_clock', $event)"
      @pointerup.stop="$emit('element-pointerup', 'status_clock', $event)"
    >
      {{ timeString }}
    </div>

    <div :class="positioned ? 'contents' : 'flex items-center gap-3'">
      <div
        data-label="status_date"
        :style="elementStyle('status_date')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg transition-transform hover:scale-102 hover:border-white/25 hover:bg-white/10 duration-300 cursor-grab active:cursor-grabbing',
          positioned ? 'pointer-events-auto' : '',
        ]"
        @pointerdown.stop="$emit('element-pointerdown', 'status_date', $event)"
        @pointerup.stop="$emit('element-pointerup', 'status_date', $event)"
      >
        <span class="material-symbols-outlined text-white/70 text-[16px]">calendar_today</span>
        <span class="text-white/80 text-[13px] font-medium tracking-tight">{{ dateString }}</span>
      </div>

      <!--
        ========================================================================
        TÍCH HỢP THỜI TIẾT TỰ ĐỘNG THEO VỊ TRÍ THỰC TẾ (FRONTEND GEOLOCATION)
        ========================================================================
        Hệ thống tự động sử dụng Geolocation API của trình duyệt để xin tọa độ GPS 
        của người dùng hiện tại, sau đó gọi trực tiếp API thời tiết miễn phí Open-Meteo 
        từ phía Frontend mà không cần thông qua Backend:
        
        API: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
        
        Nếu người dùng chặn quyền định vị, hệ thống sẽ tự động dùng tọa độ mặc định (Hà Nội).
        ========================================================================
      -->
      <div
        data-label="status_weather"
        :style="elementStyle('status_weather')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg transition-transform hover:scale-102 hover:border-white/25 hover:bg-white/10 duration-300 cursor-grab active:cursor-grabbing',
          positioned ? 'pointer-events-auto' : '',
        ]"
        @pointerdown.stop="$emit('element-pointerdown', 'status_weather', $event)"
        @pointerup.stop="$emit('element-pointerup', 'status_weather', $event)"
      >
        <span class="material-symbols-outlined text-[16px] animate-pulse" :class="weatherIconColorClass">{{ weatherIcon }}</span>
        <span class="text-white/80 text-[13px] font-medium tracking-tight">{{ weatherText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusPanel',
  props: {
    positioned: {
      type: Boolean,
      default: false,
    },
    elementPositions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      timeString: '',
      dateString: '',
      greeting: '',
      timer: null,
      weatherTemp: 30,
      weatherText: '30°C • Clear Sky',
      weatherIcon: 'sunny',
      weatherIconColorClass: 'text-amber-400',
    }
  },
  computed: {
    rootClass() {
      return this.positioned
        ? 'absolute inset-0 z-20 text-center select-none pointer-events-none'
        : 'flex flex-col items-center justify-center text-center select-none pt-1 pb-2 max-w-xl w-full'
    },
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
    this.getWeather()
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    elementStyle(id) {
      if (!this.positioned || !this.elementPositions[id]) return {}
      const pos = this.elementPositions[id]
      return {
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 20,
      }
    },
    async getWeather() {
      const defaultLat = 21.0285; // Hanoi
      const defaultLon = 105.8542;

      const fetchWeatherFromAPI = async (lat, lon) => {
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          if (!response.ok) return;
          const data = await response.json();
          if (data && data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            
            // Map weather codes to Material icons and Vietnamese/English descriptions
            let desc = 'Clear Sky';
            let icon = 'sunny';
            let iconColor = 'text-amber-400';

            if (code === 0) {
              desc = 'Clear Sky';
              icon = 'sunny';
              iconColor = 'text-amber-400';
            } else if ([1, 2, 3].includes(code)) {
              desc = 'Partly Cloudy';
              icon = 'cloud';
              iconColor = 'text-blue-300';
            } else if ([45, 48].includes(code)) {
              desc = 'Foggy';
              icon = 'foggy';
              iconColor = 'text-gray-300';
            } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
              desc = 'Rainy';
              icon = 'rainy';
              iconColor = 'text-sky-400';
            } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
              desc = 'Snowy';
              icon = 'ac_unit';
              iconColor = 'text-blue-100';
            } else if ([95, 96, 99].includes(code)) {
              desc = 'Thunderstorm';
              icon = 'thunderstorm';
              iconColor = 'text-purple-400';
            }

            this.weatherTemp = temp;
            this.weatherText = `${temp}°C • ${desc}`;
            this.weatherIcon = icon;
            this.weatherIconColorClass = iconColor;
          }
        } catch (e) {
          // Keep default if call fails
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherFromAPI(position.coords.latitude, position.coords.longitude);
          },
          () => {
            fetchWeatherFromAPI(defaultLat, defaultLon);
          }
        );
      } else {
        fetchWeatherFromAPI(defaultLat, defaultLon);
      }
    },
    updateTime() {
      const now = new Date()

      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      this.timeString = `${hh}:${mm}`

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      const dayName = days[now.getDay()]
      const day = now.getDate()
      const monthName = months[now.getMonth()]
      const year = now.getFullYear()

      this.dateString = `${dayName}, ${day} ${monthName} ${year}`

      /*
        ========================================================================
        TODO: CHỖ NÀY SẼ THAY BẰNG LOGIC BACKEND (HIỂN THỊ TÊN USER ĐÃ ĐĂNG NHẬP)
        ========================================================================
        Thay vì cứng nhắc "User", khi user đã đăng nhập thành công vào hệ thống:
        1. Lấy thông tin user profile từ LocalStorage, Vuex/Pinia Store hoặc Cookie:
           const loggedInUser = JSON.parse(localStorage.getItem('user_profile'));
        2. Hiển thị lời chào cá nhân hóa:
           this.greeting = `Welcome, ${loggedInUser?.fullName || 'User'}👋`
        ========================================================================
      */
      const mockUserName = localStorage.getItem('mock_user_name') || 'User';
      this.greeting = `Welcome, ${mockUserName}👋`;
    },
  },
}
</script>

<style scoped>
@keyframes glow-pulse {
  0%, 100% {
    text-shadow: 0 0 16px rgba(255, 255, 255, 0.25), 0 0 32px rgba(173, 198, 255, 0.2);
  }
  50% {
    text-shadow: 0 0 28px rgba(255, 255, 255, 0.45), 0 0 48px rgba(173, 198, 255, 0.4);
  }
}

.animate-glow {
  animation: glow-pulse 4s ease-in-out infinite;
}

.scale-102:hover {
  transform: scale(1.02);
}
</style>
