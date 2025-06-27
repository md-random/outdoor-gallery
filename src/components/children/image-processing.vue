<template>
  <div class="upload-container">
    <div class="file-list" v-if="files.length > 0">
      <h3>Files</h3>
      <div v-for="(file, index) in files" :key="file.name" class="file-item">
        <img
          :src="`http://localhost:3000/api/thumbnail?file=${encodeURIComponent(file.name)}`"
          alt="thumb"
          class="thumb"
        />

        <div class="file-text">
          <span>{{ file.name }}</span
          ><br />
          <span CLASS="file-size">
            {{ (file.size / 1000).toFixed(1) }} KB
            <template v-if="progressUpdatesMap[file.name]">
              →
              {{ (progressUpdatesMap[file.name].optimizedSize / 1000).toFixed(1) }} KB (
              {{
                (
                  100 -
                  (progressUpdatesMap[file.name].optimizedSize /
                    progressUpdatesMap[file.name].originalSize) *
                    100
                ).toFixed(1)
              }}
              %)
            </template>
          </span>
        </div>
        <button v-if="!isUploading" @click="removeFile(index)">Remove</button>
      </div>
    </div>

    <div class="center-area">
      <h2>Upload and Optimize Images</h2>
      <p class="meta-data">meta-data from image will be stripped out.</p>
      <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop">
        <p>Drag and drop images here, or click to select files.</p>
        <input type="file" accept="image/*" multiple @change="handleFileSelect" />
      </div>
      <button
        class="upload-button"
        :disabled="files.length === 0 || isUploading"
        @click="uploadFiles"
      >
        {{ isUploading ? 'Uploading...' : 'Optimize and Upload' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const files = ref<File[]>([])
const previews = ref<string[]>([])
const isUploading = ref(false)
const progressUpdatesMap = ref<Record<string, { optimizedSize: number; originalSize: number }>>({})

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

    await response.json()

    files.value = []
    previews.value = []
  } catch (error) {
    console.error('Error uploading files:', error)
  } finally {
    isUploading.value = false
  }
}

onMounted(() => {
  const eventSource = new EventSource('http://localhost:3000/api/optimize-progress')
  eventSource.onmessage = (event) => {
    const update = JSON.parse(event.data)
    progressUpdatesMap.value[update.file] = {
      optimizedSize: update.optimizedSize,
      originalSize: update.originalSize,
    }
  }
})
</script>

<style scoped>
.upload-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 80px;
  padding: 20px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 12px;
  box-sizing: border-box;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.file-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.meta-data {
  font-size: 12px;
  color: crimson;
  font-weight: 800;
  margin: 0 !important;
}

button {
  padding: 6px 10px;
  background-color: #f44336;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.center-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 320px;
}

.dropzone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  width: 320px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.dropzone:hover {
  background-color: #f0f0f0;
}

input[type='file'] {
  display: none;
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
