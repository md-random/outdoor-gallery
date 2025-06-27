<template>
  <div class="grid-gallery">
    <div v-for="(image, index) in images" :key="index" class="grid-item">
      <img :src="image.src" :alt="image.alt" class="gallery-image" />
      <div class="image-metadata">
        <p>{{ image.description || 'No Description' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Image {
  src: string
  alt: string
  description: string
}

defineProps<{
  images: Image[]
}>()
</script>

<style scoped>
.grid-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.grid-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.gallery-image {
  width: 100%;
  height: 300px;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.grid-item:hover .gallery-image {
  transform: scale(1.05);
}

.image-metadata {
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 100%;
  text-align: center;
  padding: 5px;
  font-size: 14px;
}
</style>
