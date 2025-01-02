# Outdoor Gallery Application

## Overview

The Outdoor Gallery is a Vue.js application for displaying and filtering images in both a **Masonry Grid Layout** and a **Carousel Viewer**. It provides dynamic filtering options and visually engaging image navigation.

---

## 1. Parent Component: `outdoor-gallery.vue`

### Overview

The **parent component** acts as the application's controller, managing layout switching, image filtering, and data fetching.

### Responsibilities

- Fetching images from a `public/images.json` file.
- Filtering images based on selected categories.
- Switching between the **Masonry Layout** and **Carousel Viewer**.

### Key Highlights

- **Dynamic Filtering**:

```javascript
const filteredImages = computed(() => {
  if (selectedType.value === 'All') return images.value
  return images.value.filter((image) => image.type.includes(selectedType.value))
})
```

- **Dynamic View Switching**:

```javascript
const currentComponent = computed(() =>
  selectedView.value === 'Masonry' ? MasonryGallery : CarouselGallery,
)
```

---

## 2. Masonry Gallery (`masonry-gallery.vue`)

### Overview

Displays images in a **masonry grid layout**, optimizing space based on image orientation.

### Responsibilities

- Fetching images and arranging them in a responsive masonry grid.
- Filtering images dynamically based on user input.

### Key Highlights

- **Masonry Layout Arrangement**:

```javascript
const arrangeMasonry = () => {
  if (!masonry.value) return

  const items = Array.from(masonry.value.children)
  const columnCount = Math.floor(masonry.value.offsetWidth / 250)
  const columnHeights = Array(columnCount).fill(0)

  items.forEach((item) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights))
    item.style.top = `${columnHeights[column]}px`
    item.style.left = `${column * 250}px`
    columnHeights[column] += item.offsetHeight
  })

  masonry.value.style.height = `${Math.max(...columnHeights)}px`
}
```

- **Dynamic Orientation Handling**:

```javascript
const setImageOrientation = () => {
  images.value.forEach((image) => {
    const img = new Image()
    img.src = image.src
    img.onload = () => {
      image.orientation = img.height > img.width ? 'vertical' : 'horizontal'
    }
  })
}
```

---

## 3. Carousel Gallery (`carousel-gallery.vue`)

### Overview

Displays images in a **carousel viewer** with a synchronized thumbnail navigation system.

### Responsibilities

- Displaying one image at a time in the carousel.
- Synchronizing the thumbnail navigation with the currently displayed image.
- Animating the active thumbnail and looping the thumbnail block.

### Key Highlights

- **Thumbnail Synchronization**:

```javascript
const visibleThumbnails = computed(() => {
  const start = Math.max(0, currentIndex.value - 4)
  const end = Math.min(images.value.length, currentIndex.value + 5)
  return images.value.slice(start, end)
})
```

- **Looping Thumbnails**:

```javascript
const goToNextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

const goToPreviousImage = () => {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}
```

- **Active Thumbnail Highlighting**:

```css
.thumbnail.active {
  transform: scale(1.3);
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.5);
  }
}
```

---

## 4. Common Features

### Filtering Options

- **Categories**: Views, Trails, Signs, Basenjis, All.
- **Dynamic**: Updates the images shown in real-time.

### Styling Highlights

- **Masonry Grid**: Dynamic arrangement based on image dimensions.
- **Carousel Viewer**: Smooth transitions and synchronized thumbnail navigation.
- **Responsive Design**: Works seamlessly on different screen sizes.
- **Color Palette**:
  #3D5220 Bronzetone
  #B7CB99 Laurel Green
  #778FD2 Wild Blue Yonder
  #2A3759 Delft Blue
  #431D32 Blue-Magenta

---

## How to Run the Application

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/<username>/outdoor-gallery.git
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:

   ```bash
   npm run dev
   ```

4. **Build for Production**:

   ```bash
   npm run build
   ```

5. **Preview the Build**:
   ```bash
   npm run preview
   ```

---

## Directory Structure

```
public/
  images.json      # Image metadata
  IMG_*.jpg        # Images used in the gallery
src/
  components/
    masonry-gallery.vue
    carousel-gallery.vue
  App.vue
  main.ts
```
