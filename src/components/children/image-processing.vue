<template>
  <div class="image-upload-wrapper">
    <h2>Upload and Optimize Images</h2>
    <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop">
      <p>Drag and drop images here, or click to select files.</p>
      <input type="file" accept="image/*" multiple @change="handleFileSelect" />
    </div>

    <!-- File Preview Section -->
    <div class="upload-list" v-if="files.length > 0">
      <h3>Files to Optimize</h3>
      <div v-for="(file, index) in files" :key="index" class="upload-item">
        <div class="file-info">
          <span>{{ file.name }}</span>
          <span>Original: {{ (file.size / 1000).toFixed(2) }} KB</span>
        </div>
        <img :src="previews[index]" alt="preview" class="preview" />
        <button @click="removeFile(index)">Remove</button>
      </div>
    </div>

    <button
      class="upload-button"
      :disabled="files.length === 0 || isUploading"
      @click="uploadFiles"
    >
      {{ isUploading ? 'Uploading...' : 'Optimize and Upload' }}
    </button>

    <!-- Display Optimized Images -->
    <div class="optimized-list" v-if="optimizedImages.length > 0">
      <h3>Optimized Images</h3>
      <div v-for="image in optimizedImages" :key="image.optimizedPath" class="optimized-item">
        <a :href="'http://localhost:3000' + image.optimizedPath" target="_blank">
          <img :src="'http://localhost:3000' + image.optimizedPath" alt="optimized preview" />
        </a>
        <span>Size: {{ (image.size / 1000).toFixed(2) }} KB</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const files = ref<File[]>([])
const previews = ref<string[]>([])
const optimizedImages = ref<{ optimizedPath: string; size: number }[]>([])
const isUploading = ref(false)

const handleDrop = (event: DragEvent) => {
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles) addFiles(Array.from(droppedFiles))
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = input.files
  if (selectedFiles) addFiles(Array.from(selectedFiles))
}

const addFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter((file) => file.type.startsWith('image/'))
  files.value.push(...validFiles)
  validFiles.forEach((file) => {
    previews.value.push(URL.createObjectURL(file))
  })
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

const uploadFiles = async () => {
  isUploading.value = true

  try {
    const formData = new FormData()
    files.value.forEach((file) => formData.append('images', file))

    const response = await fetch('http://localhost:3000/api/optimize-images', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Failed to upload and optimize images.')

    const result = await response.json()
    optimizedImages.value = result.optimizedImages

    // Clear the files and previews
    files.value = []
    previews.value = []
    alert('Images optimized and uploaded successfully!')
  } catch (error) {
    console.error('Error uploading files:', error)
    alert('Failed to optimize and upload images.')
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-family: Arial, sans-serif;
}

.dropzone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  max-width: 400px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.dropzone:hover {
  background-color: #f0f0f0;
}

input[type='file'] {
  display: none;
}

.upload-list,
.optimized-list {
  width: 100%;
  max-width: 400px;
}

.upload-item,
.optimized-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.file-info,
.optimized-item span {
  margin-top: 8px;
  text-align: center;
}

.preview,
.optimized-item img {
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.upload-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
