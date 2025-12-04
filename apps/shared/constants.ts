// Shared constants

export const API_ENDPOINTS = {
  GENERATE_SCRIPT: '/api/generate/script',
  GENERATE_VOICE: '/api/generate/voice',
  GENERATE_IMAGE: '/api/generate/image',
  GENERATE_VIDEO: '/api/generate/video',
  ASSEMBLE: '/api/generate/assemble',
  PROJECT_CREATE: '/api/project/create',
  PROJECT_UPDATE: '/api/project/update',
  PROJECT_STATUS: '/api/project/status',
} as const;

export const VIDEO_PROVIDERS = {
  PIKA: 'pika',
  RUNWAY: 'runway',
} as const;

export const IMAGE_PROVIDERS = {
  DALLE: 'dalle',
  SDXL: 'sdxl',
} as const;

