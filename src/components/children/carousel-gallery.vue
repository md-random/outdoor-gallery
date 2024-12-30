<template>
  <div class="carousel-container">
    <!-- Main Carousel Image -->
    <div class="carousel-image" v-if="images.length > 0">
      <button class="prev-button" @click="prevSlide">&lt;</button>
      <img :src="currentImage.src" :alt="currentImage.alt" class="active" />
      <button class="next-button" @click="nextSlide">&gt;</button>
    </div>
    <div class="carousel-image" v-else>
      <p>No images available</p>
    </div>

    <!-- Thumbnail Block -->
    <div class="thumbnail-container" v-if="images.length > 0">
      <div class="thumbnail-wrapper" :style="{ transform: `translateX(-${1}px)` }">
        <div
          v-for="(image, index) in visibleThumbnails"
          :key="index"
          class="thumbnail"
          :class="{ active: index === middleThumbnailIndex }"
          @click="jumpToSlide(index)"
        >
          <img :src="image.src" :alt="image.alt" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Define props with default fallback values
interface Image {
  src: string
  alt: string
  type: string[]
  description: string
  orientation: string
}

const props = defineProps<{
  images?: Image[]
}>()

// Provide a default value if props.images is undefined or null
const images = computed(() => props.images || [])

// Control the number of thumbnails to show
const thumbnailsToShow = 9
const currentIndex = ref(0)

// Dynamically calculate visible thumbnails
const visibleThumbnails = computed(() => {
  const totalImages = images.value.length
  if (totalImages === 0) return []

  const start = (currentIndex.value - Math.floor(thumbnailsToShow / 2) + totalImages) % totalImages
  const thumbnails = []

  for (let i = 0; i < thumbnailsToShow; i++) {
    thumbnails.push(images.value[(start + i) % totalImages])
  }
  return thumbnails
})

// Calculate the middle index for the "active" class
const middleThumbnailIndex = Math.floor(thumbnailsToShow / 2)

// Calculate scroll offset
const scrollOffset = computed(() => {
  return middleThumbnailIndex * 90 // Each thumbnail is 90px wide (80px + 10px margin)
})

// Current image in the carousel
const currentImage = computed(() => images.value[currentIndex.value] || {})

// Move to next image
const nextSlide = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

// Move to previous image
const prevSlide = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

// Jump to a specific slide
const jumpToSlide = (index: number) => {
  const totalImages = images.value.length
  if (totalImages === 0) return
  currentIndex.value =
    (index + currentIndex.value - middleThumbnailIndex + totalImages) % totalImages
}
</script>

<style scoped>
.carousel-container {
  text-align: center;
}

.carousel-image {
  position: relative;
  width: 80%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image img {
  width: 100%;
  border-radius: 10px;
}

.prev-button,
.next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 24px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 2;
}

.prev-button {
  left: -20px;
}

.next-button {
  right: -20px;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  overflow: hidden;
  position: relative;
  width: 90%;
  margin: 0 auto;
}

.thumbnail-wrapper {
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.thumbnail {
  width: 80px;
  height: 80px;
  margin: 0 5px;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}

.thumbnail.active {
  border: 2px solid cornflowerblue;
  transform: scale(1.3);
  animation: pulse 0.5s ease;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

/* Animation for active thumbnail */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.2);
  }
}
</style>
