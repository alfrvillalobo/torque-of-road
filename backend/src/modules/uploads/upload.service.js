const cloudinary       = require('../../config/cloudinary')
const UploadRepository = require('./upload.repository')

// Sube el buffer de memoria al stream de Cloudinary
// Usamos stream porque multer guarda el archivo en memoria, no en disco
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // máximo 1200px
          { quality: 'auto', fetch_format: 'auto' },    // optimización automática
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

// Extrae el public_id de Cloudinary desde la URL segura
// Ej: https://res.cloudinary.com/.../torque-off-road/products/abc123.jpg
//     → torque-off-road/products/abc123
function extractPublicId(url) {
  try {
    const parts      = url.split('/')
    const filename   = parts[parts.length - 1].split('.')[0]  // quitar extensión
    const folder     = parts[parts.length - 2]
    const parentFolder = parts[parts.length - 3]
    return `${parentFolder}/${folder}/${filename}`
  } catch {
    return null
  }
}

const UploadService = {
  async uploadProductImage(productId, fileBuffer) {
    // Verificar que el producto existe
    const product = await UploadRepository.findProductById(productId)
    if (!product) {
      const err = new Error('Producto no encontrado')
      err.status = 404; throw err
    }

    // Subir a Cloudinary
    const result = await uploadToCloudinary(fileBuffer, 'torque-off-road/products')

    // Calcular el orden de la imagen en la galería
    const displayOrder = await UploadRepository.getNextDisplayOrder(productId)

    // Guardar en la DB
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

    // Intentar borrar de Cloudinary — si falla no bloqueamos la respuesta
    // porque el registro ya fue eliminado de la DB
    const publicId = extractPublicId(image.url)
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch {
        // Fallo silencioso intencional — la imagen ya no existe en DB
        // aunque quede huérfana en Cloudinary
      }
    }

    return { message: 'Imagen eliminada' }
  },
}

module.exports = UploadService