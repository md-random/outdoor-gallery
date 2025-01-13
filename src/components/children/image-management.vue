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
    <div v-if="isLoading">Loading...</div>
    <div v-else class="image-grid">
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
          Alt:
          <input
            :value="meta.alt"
            @input="(e) => updateField(index, 'alt', (e.target as HTMLInputElement).value)"
            placeholder="Alt text"
          />
          Description:
          <textarea
            :value="meta.description"
            @input="
              (e) => updateField(index, 'description', (e.target as HTMLTextAreaElement).value)
            "
            placeholder="Description"
          ></textarea>
          Location:
          <input
            :value="meta.location"
            @input="(e) => updateField(index, 'location', (e.target as HTMLInputElement).value)"
            placeholder="Location"
          />
          <div class="type-container">
            Type:
            <label v-for="type in allowedTypes" :key="type" class="type-checkbox">
              <input
                type="checkbox"
                :checked="meta.type.includes(type)"
                @change="toggleType(index, type)"
              />
              {{ type }}
            </label>
          </div>
        </div>
      </div>
    </div>
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

const updateMetadata = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata.value),
    })
    if (!response.ok) {
      throw new Error('Failed to update metadata')
    }
    console.log('Metadata updated successfully')
  } catch (error) {
    console.error('Error updating metadata:', error)
  }
}

const filteredMetadata = computed(() => {
  switch (filterType.value) {
    case 'matched':
      return metadata.value.filter(
        (meta) => meta.src && meta.alt && meta.type.length > 0 && meta.description && meta.location,
      )
    case 'unmatched':
      return metadata.value.filter(
        (meta) =>
          !meta.src || !meta.alt || meta.type.length === 0 || !meta.description || !meta.location,
      )
    default:
      return metadata.value
  }
})

const updateField = async (index: number, field: keyof ImageMetadata, value: string | string[]) => {
  metadata.value[index][field] = value as never
  await updateMetadata()
}

const toggleType = async (index: number, type: string) => {
  const metaTypes = metadata.value[index].type
  if (metaTypes.includes(type)) {
    metadata.value[index].type = metaTypes.filter((t) => t !== type)
  } else {
    metadata.value[index].type.push(type)
  }
  await updateMetadata()
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

onMounted(async () => {
  await fetchImages()
  await fetchMetadata()
  isLoading.value = false
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
  text-align: center;
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
  font-size: 12px;
}

.type-checkbox {
  display: flex;
  align-items: center;
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
</style>
