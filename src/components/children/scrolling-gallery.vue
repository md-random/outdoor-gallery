<template>
  <div class="moving-gallery" ref="galleryContainer">
    <div
      class="image-item"
      v-for="(image, index) in filteredImages"
      :key="index"
      :class="image.orientation"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <img :src="image.src" :alt="image.alt" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Image {
  src: string
  alt: string
  description: string
  type: string[]
  orientation: 'horizontal' | 'vertical'
}

const props = defineProps<{
  images: Image[]
  selectedType: string
}>()

const galleryContainer = ref<HTMLDivElement | null>(null)
let scrollAnimationFrame: number | null = null

const filteredImages = computed(() => {
  if (!props.selectedType || props.selectedType === 'All') {
    return props.images
  }
  return props.images.filter((image) => image.type.includes(props.selectedType))
})

const startScroll = () => {
  if (!galleryContainer.value) return
  const container = galleryContainer.value

  const scrollUp = () => {
    container.scrollTop += 3.14 / 1.7
    if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
      container.scrollTop = 0
    }
    scrollAnimationFrame = requestAnimationFrame(scrollUp)
  }

  scrollAnimationFrame = requestAnimationFrame(scrollUp)
}

const pauseScroll = () => {
  if (scrollAnimationFrame) cancelAnimationFrame(scrollAnimationFrame)
}

const resumeScroll = () => {
  startScroll()
}

onMounted(() => {
  startScroll()
})
</script>

<style scoped>
.moving-gallery {
  position: relative;
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: 7%;
  gap: 20px;
  width: 50%;
}

.image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-in-out;
  border-radius: 8px;
  object-fit: contain;
}

.image-item.horizontal {
  height: 100%;
  width: 70%;
}

.image-item.vertical {
  height: 100%;
  width: 70%;
}

.image-item.horizontal img {
  height: auto;
  width: 100%;
}

.image-item.vertical img {
  height: auto;
  width: 100%;
}

/* Image styling */
.image-item img {
  object-fit: cover;
  border-radius: 8px;
  display: block;
}
</style>
