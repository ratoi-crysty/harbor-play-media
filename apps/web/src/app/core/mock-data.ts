import { MediaModel } from '@harbor-play-media/shared-api';

const CDN = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

export const MOCK_MEDIA: MediaModel[] = [
  {
    id: '1',
    title: 'Big Buck Bunny — Animated Short Film',
    description:
      'A large and lovable rabbit deals with bullying from a group of small animals in this award-winning animated short.',
    thumbnailUrl: 'https://picsum.photos/seed/bunny/400/225',
    url: `${CDN}/BigBuckBunny.mp4`,
    duration: 596,
    fileSize: 276000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-01-15T10:00:00Z',
    viewCount: 15230,
    tags: [],
  },
  {
    id: '2',
    title: "Elephant's Dream — Blender Open Film",
    description:
      'The story of two strange characters exploring a capricious and seemingly infinite machine. The first Blender open movie project.',
    thumbnailUrl: 'https://picsum.photos/seed/cosmos/400/225',
    url: `${CDN}/ElephantsDream.mp4`,
    duration: 653,
    fileSize: 1800000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-01-20T14:30:00Z',
    viewCount: 42100,
    tags: [],
  },
  {
    id: '3',
    title: 'Tears of Steel — Sci-Fi Short',
    description:
      'In an apocalyptic future, a group of soldiers and scientists take a last stand against a force of robots in Amsterdam.',
    thumbnailUrl: 'https://picsum.photos/seed/lofi/400/225',
    url: `${CDN}/TearsOfSteel.mp4`,
    duration: 734,
    fileSize: 150000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-02-01T08:00:00Z',
    viewCount: 8890,
    tags: [],
  },
  {
    id: '4',
    title: 'Subaru Outback — On Street and Dirt',
    description:
      'Stunning aerial footage and techniques for capturing breathtaking landscapes from above.',
    thumbnailUrl: 'https://picsum.photos/seed/drone/400/225',
    url: `${CDN}/SubaruOutbackOnStreetAndDirt.mp4`,
    duration: 60,
    fileSize: 980000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-02-05T16:00:00Z',
    viewCount: 33400,
    tags: [],
  },
  {
    id: '5',
    title: 'For Bigger Joyrides',
    description:
      'Learn the art of capturing authentic human moments in urban environments.',
    thumbnailUrl: 'https://picsum.photos/seed/street/400/225',
    url: `${CDN}/ForBiggerJoyrides.mp4`,
    duration: 15,
    fileSize: 620000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-02-10T12:00:00Z',
    viewCount: 19750,
    tags: [],
  },
  {
    id: '6',
    title: 'For Bigger Escapes',
    description:
      'Soothing sounds of ocean waves for sleep, meditation, and stress relief.',
    thumbnailUrl: 'https://picsum.photos/seed/ocean/400/225',
    url: `${CDN}/ForBiggerEscapes.mp4`,
    duration: 15,
    fileSize: 52000000,
    mimeType: 'video/mp4',
    createdAt: '2024-02-14T09:00:00Z',
    viewCount: 6230,
    tags: [],
  },
  {
    id: '7',
    title: 'For Bigger Blazes',
    description:
      'A stunning timelapse journey through metropolitan cities as night falls.',
    thumbnailUrl: 'https://picsum.photos/seed/city/400/225',
    url: `${CDN}/ForBiggerBlazes.mp4`,
    duration: 15,
    fileSize: 340000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-02-18T20:00:00Z',
    viewCount: 27800,
    tags: [],
  },
  {
    id: '8',
    title: 'Sintel — Blender Fantasy Film',
    description:
      'A lonely young woman searches for her baby dragon in a breathtaking hand-drawn fantasy world.',
    thumbnailUrl: 'https://picsum.photos/seed/aurora/400/225',
    url: `${CDN}/Sintel.mp4`,
    duration: 888,
    fileSize: 2100000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-02-22T07:00:00Z',
    viewCount: 51200,
    tags: [],
  },
  {
    id: '9',
    title: 'Volkswagen GTI Review',
    description:
      'A handpicked selection of timeless jazz recordings from the Blue Note era.',
    thumbnailUrl: 'https://picsum.photos/seed/jazz/400/225',
    url: `${CDN}/VolkswagenGTIReview.mp4`,
    duration: 45,
    fileSize: 95000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-03-01T11:00:00Z',
    viewCount: 11400,
    tags: [],
  },
  {
    id: '10',
    title: 'What Car Can You Get For A Grand?',
    description:
      'Dive into the mysterious depths of the ocean with award-winning underwater cinematography.',
    thumbnailUrl: 'https://picsum.photos/seed/ocean2/400/225',
    url: `${CDN}/WhatCarCanYouGetForAGrand.mp4`,
    duration: 60,
    fileSize: 1500000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-03-05T15:00:00Z',
    viewCount: 38600,
    tags: [],
  },
  {
    id: '11',
    title: 'We Are Going On Bullrun',
    description:
      'The best indie rock tracks of 2024, curated by music enthusiasts worldwide.',
    thumbnailUrl: 'https://picsum.photos/seed/rock/400/225',
    url: `${CDN}/WeAreGoingOnBullrun.mp4`,
    duration: 60,
    fileSize: 78000000,
    mimeType: 'video/mp4',
    resolution: '720p',
    createdAt: '2024-03-10T13:00:00Z',
    viewCount: 9800,
    tags: [],
  },
  {
    id: '12',
    title: 'For Bigger Fun',
    description:
      'A visual journey across continents captured through breathtaking hyperlapses.',
    thumbnailUrl: 'https://picsum.photos/seed/world/400/225',
    url: `${CDN}/ForBiggerFun.mp4`,
    duration: 60,
    fileSize: 720000000,
    mimeType: 'video/mp4',
    resolution: '720p',
    createdAt: '2024-03-15T18:00:00Z',
    viewCount: 22300,
    tags: [],
  },
];

export function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(0)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function formatDuration(seconds: number): string {
  const h: number = Math.floor(seconds / 3600);
  const m: number = Math.floor((seconds % 3600) / 60);
  const s: number = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getMockMediaById(id: string): MediaModel {
  const media: MediaModel | undefined = MOCK_MEDIA.find((m: MediaModel) => m.id === id);

  if (!media) {
    throw new Error('No media id found.');
  }

  return media;
}
