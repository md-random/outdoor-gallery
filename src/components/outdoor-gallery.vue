<template>
  <div class="header">
    <div class="header-display">
      <div class="header-align">
        <h1>Michael Goes Outdoors</h1>
        <div @click="imageManage()" class="system-style">&#9881;</div>
      </div>
      <div class="header-align" v-if="!viewImageManagement">
        <div>
          <div class="header-display">What do you want to see?</div>
          <button
            v-for="type in types"
            :key="type"
            @click="selectType(type)"
            class="button-align"
            :class="{ active: selectedType === type }"
          >
            {{ type }}
          </button>
        </div>

        <div>
          <div class="header-display">How do you want to view it?</div>
          <button
            v-for="view in views"
            :key="view"
            @click="selectView(view)"
            class="button-align"
            :class="{ active: selectedView === view }"
          >
            {{ view }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="child-container" v-if="!viewImageManagement">
    <component :is="currentComponent" :images="filteredImages" :selectedType="selectedType" />
  </div>

  <div v-else><Manage /></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Masonry from './children/masonry-gallery.vue'
import Carousel from './children/carousel-gallery.vue'
import Scrolling from './children/scrolling-gallery.vue'
import Manage from './children/image-management.vue'

interface Image {
  src: string
  alt: string
  orientation: 'vertical' | 'horizontal'
  type: string[]
  description: string
}

const images = ref<Image[]>([])
const types = ['All', 'Views', 'Trails', 'Signs', 'Basenji']
const views = ['Masonry', 'Carousel', 'Scrolling'] as const

const selectedType = ref<string>('All')
const selectedView = ref<'Masonry' | 'Carousel' | 'Scrolling'>('Masonry')
const viewImageManagement = ref<boolean>(false)

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
    return images.value
  }
  return images.value.filter((image) => image.type.includes(selectedType.value))
})

const componentsMap = {
  Masonry,
  Carousel,
  Scrolling,
}

const currentComponent = computed(() => componentsMap[selectedView.value])

const selectType = (type: string) => {
  selectedType.value = type
}

const selectView = (view: typeof selectedView.value) => {
  selectedView.value = view
}

const imageManage = () => {
  viewImageManagement.value = !viewImageManagement.value
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Pacifico&display=swap');

* {
  font-family: 'Mulish', serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 155px;
  padding: 10px 30px;
}

.header-display {
  color: #2a3759;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
}

.header-display:not(:has(h1)) {
  color: #778fd2;
  border-bottom: 0.125em inset #778fd2;
}

.header-align {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

button {
  background: none;
  color: #778fd2;
  border: none;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  transition: all 0.0314s ease-in-out;
}

button:hover,
button.active {
  background-color: #778fd2;
  color: white;
  outline: 1px solid #b7cb99;
  border-radius: 13px;
}

.button-align {
  padding: 3px 12px;
  margin: 0 10px;
}

.child-container {
  margin-top: 200px;
}

.system-style {
  font-size: 30px;
  cursor: pointer;
  padding: 5px;
  color: #778fd2;
}
</style>
