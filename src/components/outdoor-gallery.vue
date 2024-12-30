<template>
  <div class="header-display"><h1>Michael Gets Outdoors</h1></div>
  <div class="header-align">
    <div class="type-select-container" role="radiogroup" aria-labelledby="view-type-group">
      <div class="header-display" id="view-type-group">What do you want to see?</div>
      <input type="radio" id="all" value="All" v-model="selectedType" />
      <label for="all">All</label>
      <input type="radio" id="views" value="Views" v-model="selectedType" />
      <label for="views">Views</label>
      <input type="radio" id="trails" value="Trails" v-model="selectedType" />
      <label for="trails">Trails</label>
      <input type="radio" id="signs" value="Signs" v-model="selectedType" />
      <label for="signs">Signs</label>
      <input type="radio" id="basenji" value="Basenji" v-model="selectedType" />
      <label for="basenji">Basenjis</label>
    </div>

    <div role="radiogroup" aria-labelledby="view-mode-group">
      <div class="header-display" id="view-mode-group">How do you want to view it?</div>
      <input type="radio" id="masonry" value="Masonry" v-model="selectedView" />
      <label for="masonry">Masonry</label>
      <input type="radio" id="carousel" value="Carousel" v-model="selectedView" />
      <label for="carousel">Carousel</label>
    </div>
  </div>
  <component :is="currentComponent" :images="filteredImages" :selectedType="selectedType" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Masonry from './children/masonry-gallery.vue'
import Carousel from './children/carousel-gallery.vue'

interface Image {
  src: string
  alt: string
  orientation: 'vertical' | 'horizontal'
  type: string[]
  description: string
}

const images = ref<Image[]>([])
const selectedType = ref<string>('All')
const selectedView = ref<string>('Masonry')

const fetchImages = async () => {
  const response = await fetch('/images.json')
  const data = await response.json()
  images.value = data
  setImageOrientation()
}

const setImageOrientation = () => {
  images.value.forEach((image) => {
    const img = new Image()
    img.src = image.src
    img.onload = () => {
      image.orientation = img.height > img.width ? 'vertical' : 'horizontal'
    }
  })
}

const filteredImages = computed(() => {
  if (!selectedType.value || selectedType.value === 'All') {
    console.log('Parent Filtered Images:', filteredImages.value)

    return images.value
  }
  console.log('Parent Filtered Images:', filteredImages.value)

  return images.value.filter((image) => image.type.includes(selectedType.value))
})

const currentComponent = computed(() => (selectedView.value === 'Masonry' ? Masonry : Carousel))

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap');

* {
  font-family: 'Mulish', serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}

.header-display {
  color: cornflowerblue;
  font-weight: 600;
  font-size: 20px;
  border-bottom: 3px inset cornflowerblue;
  margin-bottom: 10px;
}

.header-display:has(h1) {
  border-bottom: none !important;
}

.header-align {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 20px 30px 20px;
}

::deep(.masonry-item) {
  cursor: pointer !important;
}

.header-display ~ input,
.header-display ~ label {
  padding: 10px 8px;
}
</style>
