import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PUBLIC_DIR = path.join(new URL('.', import.meta.url).pathname, 'public')
const IMAGES_JSON_PATH = path.join(PUBLIC_DIR, 'images.json')
const PORT = 3000

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  next()
})

app.get('/api/files', (req, res) => {
  console.log('GET /api/files called')
  fs.readdir(PUBLIC_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to scan directory' })
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
    res.json(imageFiles.map((file) => `/${file}`))
  })
})

app.get('/api/metadata', (req, res) => {
  syncImagesAndMetadata()
  fs.readFile(IMAGES_JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading images.json:', err)
      return res.status(500).json({ error: 'Unable to read images.json' })
    }
    res.json(JSON.parse(data))
  })
})

app.post('/api/metadata', (req, res) => {
  const updatedMetadata = req.body

  fs.writeFile(IMAGES_JSON_PATH, JSON.stringify(updatedMetadata, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update metadata' })
    }
    res.json({ message: 'Metadata updated successfully' })
  })
})

const syncImagesAndMetadata = () => {
  const publicImages = fs
    .readdirSync(PUBLIC_DIR)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))

  const metadata = JSON.parse(fs.readFileSync(IMAGES_JSON_PATH, 'utf8'))

  const updatedMetadata = metadata.filter((meta) =>
    publicImages.includes(meta.src.replace('/', '')),
  )
  const newMetadata = publicImages
    .filter((file) => !metadata.some((meta) => meta.src === `/${file}`))
    .map((file) => ({
      src: `/${file}`,
      alt: file,
      type: [],
      description: '',
      location: '',
    }))

  const combinedMetadata = [...updatedMetadata, ...newMetadata]

  fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(combinedMetadata, null, 2), 'utf8')
}

app.get('/test-sync', (req, res) => {
  syncImagesAndMetadata()
  res.send('Sync tested')
})

app.use(express.static(PUBLIC_DIR))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  syncImagesAndMetadata()
})
