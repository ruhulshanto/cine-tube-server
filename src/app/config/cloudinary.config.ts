import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

const config: any = {
  secure: true,
}

if (env.CLOUDINARY_CLOUD_NAME) config.cloud_name = env.CLOUDINARY_CLOUD_NAME
if (env.CLOUDINARY_API_KEY) config.api_key = env.CLOUDINARY_API_KEY
if (env.CLOUDINARY_API_SECRET) config.api_secret = env.CLOUDINARY_API_SECRET

export const cloudinaryConfig = cloudinary.config(config)
export { cloudinary }
