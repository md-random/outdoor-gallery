<template>
  <div class="carousel-container">
    <div class="carousel-image" v-if="images.length > 0">
      <button class="prev-button" @click="prevSlide">&lt;</button>
      <div
        class="carousel-image-wrapper"
        :class="
          currentImage.orientation === 'vertical' ? 'vertical-container' : 'horizontal-container'
        "
      >
        <img
          :src="currentImage.src"
          :alt="currentImage.alt"
          class="active"
          :class="currentImage.orientation"
        />
      </div>
      <button class="next-button" @click="nextSlide">&gt;</button>
    </div>
    <div class="carousel-image" v-else>
      <p>No images available</p>
    </div>

    <div class="thumbnail-container" v-if="images.length > 0">
      <div class="thumbnail-wrapper">
        <div
          v-for="(image, index) in visibleThumbnails"
          :key="index"
          class="thumbnail"
          :class="{
            active: index === middleThumbnailIndex,
            vertical: image.orientation === 'vertical',
            horizontal: image.orientation === 'horizontal',
          }"
          @click="jumpToSlide(index)"
        >
          <img :src="image.src" :alt="image.alt" :class="image.orientation" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Image {
  src: string
  alt: string
  type: string[]
  description: string
  orientation: 'vertical' | 'horizontal'
}

const props = defineProps<{ images?: Image[] }>()
const images = ref<Image[]>([])
const currentIndex = ref(0)
const thumbnailsToShow = 9

const currentImage = computed(() => images.value[currentIndex.value] || {})
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

const middleThumbnailIndex = Math.floor(thumbnailsToShow / 2)

const setImageOrientation = () => {
  images.value.forEach((image) => {
    const img = new Image()
    img.src = image.src
    img.onload = () => {
      image.orientation = img.height > img.width ? 'vertical' : 'horizontal'
    }
  })
}

const nextSlide = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

const prevSlide = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

const jumpToSlide = (index: number) => {
  const totalImages = images.value.length
  if (totalImages === 0) return
  currentIndex.value =
    (index + currentIndex.value - middleThumbnailIndex + totalImages) % totalImages
}

onMounted(() => {
  if (props.images) {
    images.value = props.images
    setImageOrientation()
  }
})
</script>

<style scoped>
.carousel-container {
  text-align: center;
}

.carousel-image {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.carousel-image-wrapper.vertical-container {
  height: 55vh;
  outline: 4px ridge #778fd2;
  padding: 2px;
  background-color: #b7cb99;
  border-radius: 12px;
  margin: 5px;
}

.carousel-image-wrapper.horizontal-container {
  width: 50%;
  height: 50vh;
  outline: 4px ridge #778fd2;
  padding: 2px;
  background-color: #b7cb99;
  border-radius: 12px;
  margin: 5px;
}

img.vertical {
  width: auto;
  height: 100%;
}

img.horizontal {
  width: 100%;
  height: 100%;
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
  padding: 40px;
}

.thumbnail {
  width: auto;
  height: 79px;
  margin: 0 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 13px;
}

.thumbnail.vertical.active {
  border: 3px ridge #778fd2;
  padding: 1px;
  background-color: #b7cb99;
  transform: scale(1.5);
  margin: 0 20px;
}

.thumbnail.horizontal.active {
  border: 3px ridge #778fd2;
  padding: 1px;
  background-color: #b7cb99;
  transform: scale(1.2);
  margin: 0 20px;
}

img {
  object-fit: cover;
  border-radius: 10px;
}

.prev-button,
.next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #2a3759;
  border-radius: 12px;
  color: #b7cb99;
  border: none;
  font-size: 24px;
  font-weight: 900;
  width: 50px;
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
</style>
