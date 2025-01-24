<template>
  <div ref="masonry" class="masonry">
    <div
      v-for="image in filteredImages"
      :key="image.src"
      class="masonry-item"
      @click="expandImage(image)"
    >
      <img :src="image.src" :alt="image.alt" loading="lazy" />
    </div>

    <div v-if="selectedImageIndex !== null" class="expanded-overlay" @click="closeImage">
      <div
        class="expanded-container"
        :class="{
          'expanded-container-horizontal':
            displayedImages[selectedImageIndex].orientation === 'horizontal',
          'expanded-container-vertical':
            displayedImages[selectedImageIndex].orientation === 'vertical',
        }"
      >
        <img
          v-if="selectedImageIndex !== null"
          :src="displayedImages[selectedImageIndex].src"
          :alt="displayedImages[selectedImageIndex].alt"
          class="expanded-image"
          :class="displayedImages[selectedImageIndex].orientation"
          loading="lazy"
        />
        <div class="expanded-text">{{ displayedImages[selectedImageIndex].description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

interface Image {
  src: string
  alt: string
  orientation: 'vertical' | 'horizontal'
  type: string[]
  description: string
}

const props = defineProps<{
  selectedType: string
}>()

const images = ref<Image[]>([])
const displayedImages = ref<Image[]>([])
const masonry = ref<HTMLDivElement | null>(null)
const selectedImageIndex = ref<number | null>(null)

const fetchImages = async () => {
  const response = await fetch('/images.json')
  const data = await response.json()
  images.value = data
  console.log('Fetched Images:', images.value)
  setImageOrientation()
  shuffleImages()
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

const shuffleImages = () => {
  const shuffled = [...images.value].sort(() => Math.random() - 0.5)
  displayedImages.value = shuffled.slice(0, images.value.length)
}

const arrangeMasonry = async () => {
  const container = masonry.value
  if (!container) return

  container.style.position = 'relative'
  container.style.height = 'auto'

  const items = Array.from(container.children) as HTMLElement[]
  const columnCount = Math.floor(container.clientWidth / 250)
  const columnHeights = Array(columnCount).fill(0)

  const gutter = 10
  const columnWidth = Math.floor(container.clientWidth / columnCount) - gutter

  items.forEach((item) => {
    const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const x = minColumnIndex * (columnWidth + gutter)
    const y = columnHeights[minColumnIndex]

    item.style.position = 'absolute'
    item.style.width = `${columnWidth}px`
    item.style.left = `${x}px`
    item.style.top = `${y}px`

    columnHeights[minColumnIndex] += item.offsetHeight + gutter
  })

  container.style.height = `${Math.max(...columnHeights)}px`
}

const filteredImages = computed(() => {
  if (!props.selectedType || props.selectedType === 'All') {
    console.log('Child Filtered Images:', filteredImages.value)
    arrangeMasonry()
    return images.value
  }
  console.log('Child Filtered Images:', filteredImages.value)
  arrangeMasonry()
  return images.value.filter((image) => image.type.includes(props.selectedType))
})

watch(filteredImages, async () => {
  await nextTick()
  arrangeMasonry()
})

const expandImage = (image: Image) => {
  selectedImageIndex.value = displayedImages.value.findIndex((img) => img.src === image.src)
}

const closeImage = () => {
  selectedImageIndex.value = null
}

watch(filteredImages, async () => {
  await nextTick()
  arrangeMasonry()
})

onMounted(async () => {
  await fetchImages()

  if (masonry.value) {
    const imagesLoaded = Array.from(masonry.value.querySelectorAll<HTMLImageElement>('img')).map(
      (img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) resolve()
          else {
            img.onload = resolve
            img.onerror = resolve
          }
        })
      },
    )

    await Promise.all(imagesLoaded)
  }

  await nextTick()
  setTimeout(arrangeMasonry, 5000)

  window.addEventListener('resize', arrangeMasonry.bind(null))
})

onUnmounted(() => {
  window.addEventListener('resize', arrangeMasonry.bind(null))
})
</script>

<style scoped>
.masonry {
  position: relative;
  width: 100%;
}

.masonry-item {
  position: absolute;
  margin: 5px;
  cursor: pointer;
}

img {
  width: 100%;
  display: block;
  border-radius: 5px;
  object-fit: contain;
  height: 100%;
}

.expanded-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.expanded-container {
  background: white;
  overflow: hidden;
  padding: 10px 10px 50px;
}

.expanded-text {
  width: 100%;
  height: 40px;
  background: white;
  color: black;
  text-align: center;
  font-size: 16px;
  line-height: 40px;
}

@media screen and (max-width: 768px) {
  .expanded-container-vertical,
  .expanded-container-horizontal {
    max-width: none;
    max-height: none;
  }
}

@media screen and (min-width: 1250px) {
  .expanded-container-vertical {
    max-width: 33vw;
    max-height: 80vh;
  }

  .expanded-container-horizontal {
    max-width: 38vw;
    max-height: 75vh;
  }
}
</style>
