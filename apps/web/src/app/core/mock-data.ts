import { MediaModel } from '@harbor-play-media/shared-api';

export const MOCK_MEDIA: MediaModel[] = [
  {
    id: '1',
    title: 'Big Buck Bunny — Animated Short Film',
    description:
      'A large and lovable rabbit deals with bullying from a group of small animals in this award-winning animated short.',
    thumbnailUrl: 'https://picsum.photos/seed/bunny/400/225',
    url: '/media/1',
    duration: 596,
    fileSize: 276000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-01-15T10:00:00Z',
    viewCount: 15230,
  },
  {
    id: '2',
    title: 'Cosmos: A Documentary Journey Through Space',
    description:
      'Embark on an awe-inspiring voyage through the universe, exploring galaxies, black holes, and the origins of life.',
    thumbnailUrl: 'https://picsum.photos/seed/cosmos/400/225',
    url: '/media/2',
    duration: 3540,
    fileSize: 1800000000,
    mimeType: 'video/mkv',
    resolution: '4K',
    createdAt: '2024-01-20T14:30:00Z',
    viewCount: 42100,
  },
  {
    id: '3',
    title: 'Lo-Fi Chillhop Radio — Study & Relax',
    description:
      'A curated collection of lo-fi hip-hop beats perfect for studying, relaxing, or working.',
    thumbnailUrl: 'https://picsum.photos/seed/lofi/400/225',
    url: '/media/3',
    duration: 10800,
    fileSize: 150000000,
    mimeType: 'audio/mp3',
    createdAt: '2024-02-01T08:00:00Z',
    viewCount: 8890,
  },
  {
    id: '4',
    title: 'The Art of Drone Photography',
    description:
      'Stunning aerial footage and techniques for capturing breathtaking landscapes from above.',
    thumbnailUrl: 'https://picsum.photos/seed/drone/400/225',
    url: '/media/4',
    duration: 2400,
    fileSize: 980000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-02-05T16:00:00Z',
    viewCount: 33400,
  },
  {
    id: '5',
    title: 'Street Photography Masterclass',
    description:
      'Learn the art of capturing authentic human moments in urban environments.',
    thumbnailUrl: 'https://picsum.photos/seed/street/400/225',
    url: '/media/5',
    duration: 4320,
    fileSize: 620000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-02-10T12:00:00Z',
    viewCount: 19750,
  },
  {
    id: '6',
    title: 'Ocean Waves — Ambient Relaxation Sounds',
    description:
      'Soothing sounds of ocean waves for sleep, meditation, and stress relief.',
    thumbnailUrl: 'https://picsum.photos/seed/ocean/400/225',
    url: '/media/6',
    duration: 3600,
    fileSize: 52000000,
    mimeType: 'audio/mp3',
    createdAt: '2024-02-14T09:00:00Z',
    viewCount: 6230,
  },
  {
    id: '7',
    title: 'Timelapse: City Lights at Night',
    description:
      'A stunning timelapse journey through metropolitan cities as night falls.',
    thumbnailUrl: 'https://picsum.photos/seed/city/400/225',
    url: '/media/7',
    duration: 480,
    fileSize: 340000000,
    mimeType: 'video/mp4',
    resolution: '4K',
    createdAt: '2024-02-18T20:00:00Z',
    viewCount: 27800,
  },
  {
    id: '8',
    title: 'Northern Lights — Iceland Adventure',
    description:
      'A breathtaking documentary capturing the aurora borealis in all its glory.',
    thumbnailUrl: 'https://picsum.photos/seed/aurora/400/225',
    url: '/media/8',
    duration: 5400,
    fileSize: 2100000000,
    mimeType: 'video/mkv',
    resolution: '4K',
    createdAt: '2024-02-22T07:00:00Z',
    viewCount: 51200,
  },
  {
    id: '9',
    title: 'Jazz Classics: Blue Note Sessions',
    description:
      'A handpicked selection of timeless jazz recordings from the Blue Note era.',
    thumbnailUrl: 'https://picsum.photos/seed/jazz/400/225',
    url: '/media/9',
    duration: 7200,
    fileSize: 95000000,
    mimeType: 'audio/mp3',
    createdAt: '2024-03-01T11:00:00Z',
    viewCount: 11400,
  },
  {
    id: '10',
    title: 'Underwater World — Deep Sea Exploration',
    description:
      'Dive into the mysterious depths of the ocean with award-winning underwater cinematography.',
    thumbnailUrl: 'https://picsum.photos/seed/ocean2/400/225',
    url: '/media/10',
    duration: 3240,
    fileSize: 1500000000,
    mimeType: 'video/mp4',
    resolution: '1080p',
    createdAt: '2024-03-05T15:00:00Z',
    viewCount: 38600,
  },
  {
    id: '11',
    title: 'Indie Rock Compilation 2024',
    description:
      'The best indie rock tracks of 2024, curated by music enthusiasts worldwide.',
    thumbnailUrl: 'https://picsum.photos/seed/rock/400/225',
    url: '/media/11',
    duration: 5760,
    fileSize: 78000000,
    mimeType: 'audio/mp3',
    createdAt: '2024-03-10T13:00:00Z',
    viewCount: 9800,
  },
  {
    id: '12',
    title: 'Hyperlapses: Around the World',
    description:
      'A visual journey across continents captured through breathtaking hyperlapses.',
    thumbnailUrl: 'https://picsum.photos/seed/world/400/225',
    url: '/media/12',
    duration: 1080,
    fileSize: 720000000,
    mimeType: 'video/mp4',
    resolution: '720p',
    createdAt: '2024-03-15T18:00:00Z',
    viewCount: 22300,
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

export function getMockMediaById(id: string): MediaModel | undefined {
  return MOCK_MEDIA.find((m: MediaModel) => m.id === id);
}
