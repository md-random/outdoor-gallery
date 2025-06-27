<template>
  <div class="header">
    <div class="header-display">
      <div class="header-align">
        <h1>Michael Goes Outdoors</h1>
        <div @click="toggleManager('metadata')" title="Image Metadata Manager" class="system-style">
          Metadata Manager
        </div>
        <div
          @click="toggleManager('process')"
          title="Image Processing Manager"
          class="system-style"
        >
          Processing Manager
        </div>
      </div>
      <div v-if="!isManagerActive" class="image-style-align">
        <div>
          <div class="selection-align">Image</div>
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
          <div class="selection-align">Style</div>
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

  <!-- Render children -->
  <div class="child-container">
    <component
      v-if="!isManagerActive"
      :is="currentComponent"
      :images="filteredImages"
      :selectedType="selectedType"
    />
    <Manage v-else-if="activeManager === 'metadata'" />
    <Process v-else-if="activeManager === 'process'" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Masonry from './children/masonry-gallery.vue'
import Carousel from './children/carousel-gallery.vue'
import Scrolling from './children/scrolling-gallery.vue'
import Grid from './children/grid-gallery.vue'
import Manage from './children/image-management.vue'
import Process from './children/image-processing.vue'

interface Image {
  src: string
  alt: string
  orientation: 'vertical' | 'horizontal'
  type: string[]
  description: string
}

const images = ref<Image[]>([])
const types = ['All', 'Views', 'Trails', 'Signs', 'Basenji']
const views = ['Carousel', 'Masonry', 'Scrolling', 'Grid'] as const

const selectedType = ref<string>('All')
const selectedView = ref<'Carousel' | 'Masonry' | 'Scrolling' | 'Grid'>('Carousel')
const viewImageManagement = ref<boolean>(false)
const activeManager = ref<'metadata' | 'process' | null>(null)
const isManagerActive = computed(() => activeManager.value !== null)

const toggleManager = (manager: 'metadata' | 'process') => {
  activeManager.value = manager
}

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
  Grid,
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

const syncMetadata = async () => {
  const x = await fetch('http://localhost:3000/api/metadata')
  console.log('x', x)
  return x
}

onMounted(async () => {
  await syncMetadata()
  await fetchImages()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Atma:wght@300;400;500;600;700&family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Pacifico&family=Permanent+Marker&family=Tomorrow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

* {
  font-family: 'Mulish', serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}

.header {
  top: 0;
  left: 0;
  background-color: white;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(21, 6, 100, 0.31);
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
  justify-content: space-between;
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
  margin-top: 70px;
}

.system-style {
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  color: #778fd2;
}

.system-style:hover {
  transform: scale(1.1);
}

.selection-align {
  padding: 5px;
  font-size: 22px;
}

.image-style-align {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
