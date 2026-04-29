const cloudinary       = require('../../config/cloudinary')
const UploadRepository = require('./upload.repository')

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, 
          { quality: 'auto', fetch_format: 'auto' },    
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

function extractPublicId(url) {
  try {
    const parts      = url.split('/')
    const filename   = parts[parts.length - 1].split('.')[0]  
    const folder     = parts[parts.length - 2]
    const parentFolder = parts[parts.length - 3]
    return `${parentFolder}/${folder}/${filename}`
  } catch {
    return null
  }
}

const UploadService = {
  async uploadProductImage(productId, fileBuffer) {
    const product = await UploadRepository.findProductById(productId)
    if (!product) {
      const err = new Error('Producto no encontrado')
      err.status = 404; throw err
    }
    const result = await uploadToCloudinary(fileBuffer, 'torque-off-road/products')
    const displayOrder = await UploadRepository.getNextDisplayOrder(productId)
    const image = await UploadRepository.createImage({
      productId,
      url:          result.secure_url,
      altText:      product.name,
      displayOrder,
    })

    return image
  },

  async deleteImage(imageId) {
    const image = await UploadRepository.deleteImage(imageId)
    if (!image) {
      const err = new Error('Imagen no encontrada')
      err.status = 404; throw err
    }
    const publicId = extractPublicId(image.url)
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch {
      }
    }

    return { message: 'Imagen eliminada' }
  },
}

module.exports = UploadService