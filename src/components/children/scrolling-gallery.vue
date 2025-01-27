<template>
  <div class="gallery-wrapper">
    <div class="moving-gallery" ref="galleryContainer">
      <div
        class="image-item"
        v-for="(image, index) in filteredImages"
        :key="index"
        :class="image.orientation"
        @mouseenter="handleMouseEnter(image)"
        @mouseleave="handleMouseLeave"
      >
        <img :src="image.src" :alt="image.alt" />
      </div>
    </div>
    <div class="scroll-metadata" v-if="currentImage">
      <div>Location: {{ currentImage.location }}</div>
      <div>Description{{ currentImage.description }}</div>
      <div>
        <span>Type: </span>
        <span v-for="(type, index) in currentImage.type" :key="index">
          {{ type }}<span v-if="index < currentImage.type.length - 1">, </span>,
        </span>
      </div>
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
  location: string
}

const props = defineProps<{
  images: Image[]
  selectedType: string
}>()

const galleryContainer = ref<HTMLDivElement | null>(null)
let scrollAnimationFrame: number | null = null
const currentImage = ref<Image | null>(null)

const handleMouseEnter = (image: Image) => {
  currentImage.value = image
  pauseScroll()
}

const handleMouseLeave = () => {
  currentImage.value = null
  resumeScroll()
}

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
    container.scrollTop += 1.7
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
  margin-top: -45px;
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

.image-item img {
  object-fit: cover;
  border-radius: 8px;
  display: block;
  background-color: #f6f0f0;
  box-shadow:
    12px 12px 16px 0 rgba(0, 0, 0, 0.25),
    -8px -8px 12px 0 rgba(255, 255, 255, 0.3);
  border-radius: 50px;
}

.gallery-wrapper {
  display: flex;
  flex-direction: row;
  font-family: 'Tomorrow', serif;
  font-weight: 600;
  color: #2a3759;
}

.scroll-metadata {
  padding: 25px 25px 30px;
  display: flex;
  flex-direction: column;
  align-items: start;
  background-color: #f6f0f0;
  box-shadow:
    12px 12px 16px 0 rgba(0, 0, 0, 0.25),
    -8px -8px 12px 0 rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  height: 30%;
  width: 30%;
  margin-top: 15%;
}

.scroll-metadata div {
  padding: 10px 0;
}
</style>
