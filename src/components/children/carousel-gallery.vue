<template>
  <div class="carousel-container">
    <div class="carousel-image" v-if="galleryImages.length > 0">
      <button class="prev-button" @click="prevSlide">{{ nextButtonIcon }}</button>
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
      <div class="postcard">
        <div class="postcard-topline">
          <div>
            <div v-for="(type, index) in currentImage.type" :key="index" class="current-type">
              {{ type }}
            </div>
          </div>
          <div class="nat-park-serv-icon"><img src="/templateImages/np.png" alt="" /></div>
        </div>
        <div>
          <div><span class="postcard-greeting"> Greetings from</span></div>
          <div class="postcard-header">{{ currentImage.location }}!</div>
        </div>
        <div class="postcard-text">
          {{ currentImage.description }}
        </div>
      </div>
      <button class="next-button" @click="nextSlide">{{ nextButtonIcon }}</button>
    </div>
    <div class="carousel-image" v-else>
      <p>No images available</p>
    </div>

    <div class="thumbnail-container" v-if="galleryImages.length > 0">
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
import { ref, computed, onMounted, watch } from 'vue'

interface Image {
  src: string
  alt: string
  type: string[]
  description: string
  orientation: 'vertical' | 'horizontal'
  location: string
}

const props = defineProps<{
  images?: Image[]
  selectedType: string
}>()

const galleryImages = ref<Image[]>([])
const currentIndex = ref(0)
const thumbnailsToShow = 9

const currentImage = computed(() => galleryImages.value[currentIndex.value] || {})
const visibleThumbnails = computed(() => {
  const totalImages = galleryImages.value.length
  if (totalImages === 0) return []

  const start = (currentIndex.value - Math.floor(thumbnailsToShow / 2) + totalImages) % totalImages
  const thumbnails = []

  for (let i = 0; i < thumbnailsToShow; i++) {
    thumbnails.push(galleryImages.value[(start + i) % totalImages])
  }
  return thumbnails
})

const middleThumbnailIndex = Math.floor(thumbnailsToShow / 2)

const filteredImages = computed(() => {
  if (!props.selectedType || props.selectedType === 'All') {
    return props.images || []
  }
  return (props.images || []).filter((image) => image.type.includes(props.selectedType))
})

watch(filteredImages, (newFilteredImages) => {
  galleryImages.value = newFilteredImages
  currentIndex.value = 0
})

const setImageOrientation = () => {
  galleryImages.value.forEach((image) => {
    const img = new Image()
    img.src = image.src
    img.onload = () => {
      image.orientation = img.height > img.width ? 'vertical' : 'horizontal'
    }
  })
}

const nextSlide = () => {
  if (galleryImages.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % galleryImages.value.length
}

const prevSlide = () => {
  if (galleryImages.value.length === 0) return
  currentIndex.value =
    (currentIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

const jumpToSlide = (index: number) => {
  const totalImages = galleryImages.value.length
  if (totalImages === 0) return
  currentIndex.value =
    (index + currentIndex.value - middleThumbnailIndex + totalImages) % totalImages
}

const nextButtonIcon = computed(() => {
  console.log('props.selectedType', props.selectedType)
  switch (props.selectedType) {
    case 'Views':
      return String.fromCodePoint(127956) // view icon
    case 'Trails':
      return String.fromCodePoint(127957) // trail icon
    case 'Signs':
      return String.fromCodePoint(128655) // sign icon
    case 'Basenji':
      return String.fromCodePoint(128021) // dog icon
    default:
      return String.fromCodePoint(128506) // Default arrow
  }
})

onMounted(() => {
  galleryImages.value = filteredImages.value
  setImageOrientation()
})
</script>

<style scoped>
.carousel-container {
  text-align: center;
}

.carousel-image {
  width: 90%;
  margin: 0 auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image-wrapper.vertical-container {
  height: 50vh;
  outline: 4px ridge #778fd2;
  padding: 2px;
  background-color: #b7cb99;
  border-radius: 12px;
  margin: 5px 0 0 125px;
}

.carousel-image-wrapper.horizontal-container {
  width: 50%;
  height: 50vh;
  outline: 4px ridge #778fd2;
  padding: 2px;
  background-color: #b7cb99;
  border-radius: 12px;
  margin: 5px 0 0 55px;
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
  background-color: white;
  border: none;
  font-size: 60px;
  font-weight: 900;
  width: 70px;
  height: 60px;
  cursor: pointer;
  z-index: 2;
  transition: all 0.5s ease-in-out;
}

.prev-button {
  left: -45px;
}

.next-button {
  right: -45px;
}

.prev-button:hover,
.next-button:hover {
  top: 43%;

  transform: scale(1.2);
}

.postcard {
  width: 33%;
  padding: 10px 10px 20px;
  margin: 20px auto;
  border: 2px solid #d4c4aa;
  border-radius: 10px;
  background: linear-gradient(145deg, #fdfdfd, #f2ebd8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  font-family: 'Atma', serif;
  color: #4a4a4a;
  text-align: left;
}

.postcard-header {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #431d32;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  padding-bottom: 20px;
  top: -20px;
  position: relative;
}

.postcard-greeting {
  font-family: 'Pacifico', serif;
  font-weight: 400;
  font-style: normal;
  font-size: 32px;
  letter-spacing: 8px;
  display: inline-block;
  width: 100%;
  text-align: start;
  top: -25px;
  margin-bottom: 12px;
  position: relative;
  color: #b7cb99;
}

.postcard-text {
  font-family: 'Atma', serif;
  font-size: 1rem;
  font-style: italic;
  color: #4a4a4a;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.1);
}

.postcard-topline {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 2000;
}

.nat-park-serv-icon {
  width: 100%;
  height: 100%;
  text-align: end;
  z-index: 999;
}

.nat-park-serv-icon img {
  position: relative;
  width: 75px;
  height: 60px;
  object-fit: contain;
}

.current-type {
  font-size: 8px;
  letter-spacing: 3px;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
