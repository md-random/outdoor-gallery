<template>
  <div class="manage-align">
    <h1>Image Metadata Manager</h1>
    <div class="filter-buttons">
      <button @click="filterType = 'all'" :class="{ active: filterType === 'all' }">All</button>
      <button @click="filterType = 'matched'" :class="{ active: filterType === 'matched' }">
        Matched
      </button>
      <button @click="filterType = 'unmatched'" :class="{ active: filterType === 'unmatched' }">
        Unmatched
      </button>
    </div>
    <div v-if="editMessage" class="edit-message">{{ editMessage }}</div>
    <div v-else-if="isLoading">Loading...</div>
    <transition name="fade">
      <div v-if="!editMessage && !isLoading" class="image-grid">
        <div v-for="(meta, index) in filteredMetadata" :key="meta.src" class="image-item">
          <div class="image-container">
            <img
              :src="'http://localhost:3000' + meta.src"
              :alt="meta.alt"
              @click="enlargeImage(meta)"
              class="clickable-image"
            />
          </div>
          <div class="metadata-card">
            <span> Alt:</span>
            <input v-model="meta.alt" placeholder="Alt text" />
            <span> Description:</span>
            <textarea v-model="meta.description" placeholder="Description"></textarea>
            <span> Location:</span>
            <input v-model="meta.location" placeholder="Location" />
            <div class="type-container">
              <span> Type:</span>
              <label v-for="type in allowedTypes" :key="type" class="type-checkbox">
                <input
                  type="checkbox"
                  :checked="meta.type.includes(type)"
                  @change="toggleType(index, type)"
                />
                {{ type }}
              </label>
            </div>
            <div class="save-icon" @click="saveMetadata(index)">💾</div>
          </div>
        </div>
      </div>
    </transition>
    <div v-if="enlargedImage" class="enlarged-image-overlay" @click="closeEnlargedImage">
      <div :class="['enlarged-image-container', isImageVertical ? 'vertical' : 'horizontal']">
        <img
          :src="'http://localhost:3000' + enlargedImage.src"
          :alt="enlargedImage.alt"
          @load="onEnlargedImageLoad"
          class="enlarged-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ImageMetadata {
  src: string
  alt: string
  type: string[]
  description: string
  location: string
}

const images = ref<string[]>([])
const metadata = ref<ImageMetadata[]>([])
const isLoading = ref(true)
const filterType = ref<'all' | 'matched' | 'unmatched'>('all')
const enlargedImage = ref<ImageMetadata | null>(null)
const isImageVertical = ref<boolean>(false)
let tempMetadata: ImageMetadata[] = []
const editMessage = ref<string>('')

const allowedTypes = ['Trails', 'Views', 'Signs', 'Basenji']

const fetchImages = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/files')
    images.value = await response.json()
  } catch (error) {
    console.error('Error fetching images:', error)
  }
}

const fetchMetadata = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/metadata')
    metadata.value = await response.json()
  } catch (error) {
    console.error('Error fetching metadata:', error)
  }
}

const saveMetadata = async (index: number) => {
  const filteredItem = filteredMetadata.value[index]
  const originalIndex = metadata.value.findIndex((meta) => meta.src === filteredItem.src)

  if (originalIndex === -1) {
    console.error('Original index not found.')
    return
  }

  metadata.value[originalIndex] = { ...tempMetadata[originalIndex] }

  const response = await fetch('http://localhost:3000/api/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata.value),
  })

  if (!response.ok) {
    throw new Error('Failed to save metadata')
  }

  console.log('Saved metadata:', metadata.value[originalIndex])
  editMessage.value = `Edit Successful for: ${filteredMetadata.value[index].src}`
  setTimeout(() => {
    editMessage.value = ''
    resetData()
  }, 3000)
}

const filteredMetadata = computed(() => {
  switch (filterType.value) {
    case 'matched':
      return tempMetadata.filter(
        (meta) => meta.src && meta.alt && meta.type.length > 0 && meta.description && meta.location,
      )
    case 'unmatched':
      return tempMetadata.filter(
        (meta) =>
          !meta.src || !meta.alt || meta.type.length === 0 || !meta.description || !meta.location,
      )
    default:
      return tempMetadata
  }
})

const toggleType = (index: number, type: string) => {
  const originalIndex = tempMetadata.findIndex(
    (meta) => meta.src === filteredMetadata.value[index].src,
  )
  const meta = tempMetadata[originalIndex]
  meta.type = meta.type.includes(type) ? meta.type.filter((t) => t !== type) : [...meta.type, type]
}

const enlargeImage = (image: ImageMetadata) => {
  enlargedImage.value = image
  isImageVertical.value = false
}

const closeEnlargedImage = () => {
  enlargedImage.value = null
}

const onEnlargedImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  isImageVertical.value = img.naturalHeight > img.naturalWidth
}

const resetData = async () => {
  await fetchImages()
  await fetchMetadata()
  tempMetadata = JSON.parse(JSON.stringify(metadata.value))
  isLoading.value = false
}

onMounted(async () => {
  resetData()
})
</script>

<style scoped>
.manage-align {
  margin-top: 200px;
}
.filter-buttons {
  margin-bottom: 20px;
}
.filter-buttons button {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #b7cb99;
  color: white;
  border: none;
  border-radius: 4px;
}
.filter-buttons button.active {
  background-color: #2a3759;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.image-item {
  position: relative;
  border-radius: 15px;
  color: #2a3759;
  border: 3px ridge #2a3759;
  box-shadow:
    -8px -8px 15px rgba(255, 255, 255, 0.5),
    8px 8px 15px rgba(0, 0, 0, 0.2);
  padding: 10px;
}
.image-container {
  width: auto;
}
.clickable-image {
  max-width: 100%;
  max-height: auto;
  object-fit: contain;
  border-radius: 5%;
  cursor: pointer;
  transition: 0.3s ease;
}
.clickable-image:hover {
  transform: scale(1.05);
}
.metadata-card {
  text-align: start;
}
.metadata-card input,
.metadata-card textarea {
  width: 90%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 2px ridge #2a3759;
  box-shadow:
    inset -4px -4px rgba(255, 255, 255, 0.5),
    inset -2px -2px rgba(0, 0, 0, 0.1);
}
.type-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  font-size: 10px;
  margin: 10px 0 25px 0;
}

.type-checkbox {
  display: flex;
  align-items: center;
}

.type-checkbox input[type='checkbox'] {
  width: 12px;
  height: 20px;
}

.save-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 16px;
  cursor: pointer;
}

span:has(textarea) {
  padding: 10px;
}

.enlarged-image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.enlarged-image-container.horizontal,
.enlarged-image-container.vertical {
  display: flex;
  justify-content: center;
  align-items: center;
}
.enlarged-image-container.horizontal {
  width: 50%;
  height: auto;
}
.enlarged-image-container.vertical {
  width: 35%;
  height: auto;
}
.enlarged-image {
  max-width: 100%;
  max-height: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
