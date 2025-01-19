<template>
  <div class="manage-align">
    <h1>Image Metadata Manager</h1>
    <div class="filter-buttons">
      <button @click="filterType = 'all'" :class="{ active: filterType === 'all' }">
        All Images <span class="count-bubble">{{ allNumber }}</span>
      </button>
      <button @click="filterType = 'matched'" :class="{ active: filterType === 'matched' }">
        Matched <span class="count-bubble">{{ matchedNumber }}</span>
      </button>
      <button @click="filterType = 'unmatched'" :class="{ active: filterType === 'unmatched' }">
        Unmatched <span class="count-bubble">{{ unmatchedNumber }}</span>
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
            <div>
              <div
                class="delete-icon"
                title="Delete Image"
                @click="deleteImageAndMetadata(meta.src)"
              >
                &#9940;
              </div>
              <div
                class="save-icon"
                title="Save Edits To Image Metadata"
                @click="saveMetadata(index)"
              >
                💾
              </div>
            </div>
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

const metadata = ref<ImageMetadata[]>([])
const isLoading = ref(true)
const filterType = ref<'all' | 'matched' | 'unmatched'>('all')
const enlargedImage = ref<ImageMetadata | null>(null)
const isImageVertical = ref<boolean>(false)
let tempMetadata: ImageMetadata[] = [] // specifically not reactive do not change
const editMessage = ref<string>('')
const allNumber = ref(0)
const matchedNumber = ref(0)
const unmatchedNumber = ref(0)

const allowedTypes = ['Trails', 'Views', 'Signs', 'Basenji']

const fetchMetadata = async () => {
  const response = await fetch('http://localhost:3000/api/metadata')
  if (!response.ok) throw new Error('Failed to fetch metadata')
  metadata.value = await response.json()
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
  editMessage.value = `Edit Successful for: ${filteredMetadata.value[index].src}`
  setTimeout(() => {
    editMessage.value = ''
  }, 3000)
  const currentFilter = filterType.value
  filterType.value = 'all'
  filterType.value = currentFilter
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

const deleteImageAndMetadata = async (src: string) => {
  console.log(`Attempting to delete image and metadata for ${src}`)

  try {
    const response = await fetch('http://localhost:3000/api/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ src }),
    })
    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${src}`)
    } else {
      const result = await response.json()
      console.log(result.message) // Logs success message
    }
  } catch (error) {
    console.error('Error deleting image and metadata:', error)
  }
  editMessage.value = `Deleted image and meta data for: ${src}`
  setTimeout(() => {
    editMessage.value = ''
  }, 3000)
  tempMetadata = tempMetadata.filter((meta) => meta.src !== src)
  const currentFilter = filterType.value
  filterType.value = 'all'
  filterType.value = 'matched'
  filterType.value = 'unmatched'
  setCounts(tempMetadata)
  filterType.value = currentFilter
}

interface ImageMetadata {
  src: string
  alt: string
  type: string[]
  description: string
  location: string
}

const setCounts = (tempMetadata: ImageMetadata[]) => {
  allNumber.value = 0
  matchedNumber.value = 0
  unmatchedNumber.value = 0

  tempMetadata.forEach((imageMetadata) => {
    if (imageMetadata) {
      allNumber.value++
    }
    if (
      imageMetadata.src &&
      imageMetadata.alt &&
      imageMetadata.type.length > 0 &&
      imageMetadata.description &&
      imageMetadata.location
    ) {
      matchedNumber.value++
    }
    if (
      !imageMetadata.src ||
      !imageMetadata.alt ||
      imageMetadata.type.length === 0 ||
      !imageMetadata.description ||
      !imageMetadata.location
    ) {
      unmatchedNumber.value++
    }
  })

  console.log('all', allNumber.value)
  console.log('matched', matchedNumber.value)
  console.log('all', unmatchedNumber.value)
}

const resetData = async () => {
  isLoading.value = true
  try {
    await fetchMetadata()
    tempMetadata = JSON.parse(JSON.stringify(metadata.value))
    setCounts(tempMetadata)
    console.log('tempMetadata', tempMetadata)
  } catch (error) {
    console.error('Error resetting data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  resetData()
})
</script>

<style scoped>
.manage-align {
  margin-top: 70px;
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

.delete-icon {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 20px;
  cursor: pointer;
}

.save-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 20px;
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

.count-bubble {
  border: 2px solid #431d32;
  background-color: #778fd2;
  color: white;
  border-radius: 50%;
  padding: 5px 5px;
  margin-left: 10px;
  font-size: 12px;
  display: inline-block;
}

.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.confirm-dialog .confirm-image {
  max-width: 100px;
  max-height: 100px;
  margin-bottom: 10px;
}

.confirm-dialog .button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.confirm-dialog button {
  background-color: #ff4747;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
}

.confirm-dialog button:hover {
  background-color: #e04040;
}

.confirm-dialog button + button {
  background-color: #6c757d;
}

.confirm-dialog button + button:hover {
  background-color: #565d64;
}
</style>
