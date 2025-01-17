import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PUBLIC_DIR = path.join(new URL('.', import.meta.url).pathname, 'public')
const IMAGES_JSON_PATH = path.join(PUBLIC_DIR, 'images.json')

app.use(express.json())
app.use(cors())

app.get('/api/files', (req, res) => {
  fs.readdir(PUBLIC_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' })
    }
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
    res.json(imageFiles.map((file) => `/${file}`))
  })
})

app.get('/api/metadata', (req, res) => {
  fs.readFile(IMAGES_JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read images.json' })
    }
    res.json(JSON.parse(data))
  })
})

app.post('/api/metadata', (req, res) => {
  const updatedMetadata = req.body

  console.log('Received payload:', req.body)

  fs.writeFile(IMAGES_JSON_PATH, JSON.stringify(updatedMetadata, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update metadata' })
    }
    res.json({ message: 'Metadata updated successfully' })
  })
})

const removeMissingMetadata = () => {
  fs.readFile(IMAGES_JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Unable to read images.json:', err)
      return
    }

    const publicImages = fs
      .readdirSync(PUBLIC_DIR)
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
    const metadata = JSON.parse(data)

    const updatedMetadata = metadata.filter((meta) =>
      publicImages.includes(meta.src.replace('/', '')),
    )

    if (updatedMetadata.length !== metadata.length) {
      fs.writeFile(IMAGES_JSON_PATH, JSON.stringify(updatedMetadata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error saving updated metadata:', err)
        } else {
          console.log('Removed metadata for missing images.')
        }
      })
    }
  })
}

app.use(express.static(PUBLIC_DIR))

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  removeMissingMetadata() // Automatically remove missing metadata when the server starts
})
