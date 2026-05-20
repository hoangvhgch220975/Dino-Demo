<template>
  <div class="fixed inset-0 z-[-1]">
    <img :src="src" alt="Wallpaper" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/40 backdrop-brightness-75"></div>
  </div>
</template>

<script>
import defaultWallpaper from '../../assets/backgr.jpg'

export default {
  name: 'WallpaperBackground',
  props: {
    src: {
      type: String,
      default: defaultWallpaper.default || defaultWallpaper,
    },
  },
}
</script>
