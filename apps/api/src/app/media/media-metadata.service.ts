import { Injectable } from '@nestjs/common';
import type { FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfprobePath(ffprobeInstaller.path);

export interface VideoMetadata {
  duration: number;
  fileSize: number;
  mimeType: string;
  resolution: string | undefined;
}

function getMimeType(formatName: string): string {
  if (formatName.includes('mp4')) return 'video/mp4';
  if (formatName.includes('webm')) return 'video/webm';
  if (formatName.includes('ogg')) return 'video/ogg';
  if (formatName.includes('mov') || formatName.includes('quicktime')) return 'video/quicktime';
  if (formatName.includes('avi')) return 'video/avi';
  if (formatName.includes('mkv') || formatName.includes('matroska')) return 'video/x-matroska';
  if (formatName.includes('mp3')) return 'audio/mpeg';
  if (formatName.includes('aac')) return 'audio/aac';
  if (formatName.includes('flac')) return 'audio/flac';
  return 'video/mp4';
}

function getResolutionLabel(height: number): string {
  if (height <= 360) return '360p';
  if (height <= 480) return '480p';
  if (height <= 720) return '720p';
  if (height <= 1080) return '1080p';
  if (height <= 1440) return '1440p';
  return '4K';
}

@Injectable()
export class MediaMetadataService {
  extractMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: Error | null, data: FfprobeData) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream: FfprobeStream | undefined = data.streams.find(
          (s: FfprobeStream) => s.codec_type === 'video',
        );

        const height: number | undefined = videoStream?.height;
        const resolution: string | undefined = height != null ? getResolutionLabel(height) : undefined;
        const formatName: string = data.format.format_name ?? '';

        resolve({
          duration: Math.round(data.format.duration ?? 0),
          fileSize: data.format.size ?? 0,
          mimeType: getMimeType(formatName),
          resolution,
        });
      });
    });
  }

  generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['5%'],
          filename: outputPath.split('/').pop() ?? 'thumbnail.jpg',
          folder: outputPath.substring(0, outputPath.lastIndexOf('/')),
          size: '640x?',
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
  }
}
