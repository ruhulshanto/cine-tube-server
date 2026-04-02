import multer from 'multer'
import { env } from './env.js'
import { cloudinary } from './cloudinary.config.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import status from "http-status";
import AppError from "../errorHelper/AppError.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cinetube',
    resource_type: 'auto',
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      return `${file.fieldname}-${uniqueSuffix}`
    },
  },
} as any)

export const upload = multer({
  storage,
  limits: {
    fileSize: Number(env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default for movies
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'video/x-matroska',
      'video/webm',
      'video/quicktime'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only standard images and common video formats (mp4, mpeg, mkv, webm, quicktime) are allowed.'))
    }
  },
})

// Dedicated uploader for profile photos: strict image-only + small size.
const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cinetube/profile-images",
    resource_type: "image",
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `profile-${uniqueSuffix}`;
    },
  },
} as any);

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError(status.BAD_REQUEST, "Invalid file type. Only JPG and PNG are allowed."));
  },
});
