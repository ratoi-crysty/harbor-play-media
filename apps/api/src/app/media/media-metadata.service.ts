import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const FFPROBE_PATH: string = ffprobeInstaller.path;

interface FfprobeFormat {
  format_name?: string;
  duration?: string;
  size?: string;
}

interface FfprobeStream {
  codec_type?: string;
  height?: number;
}

interface FfprobeOutput {
  format: FfprobeFormat;
  streams: FfprobeStream[];
}

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
      const args: string[] = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath,
      ];

      execFile(FFPROBE_PATH, args, (err: Error | null, stdout: string) => {
        if (err) {
          reject(err);
          return;
        }

        const data: FfprobeOutput = JSON.parse(stdout) as FfprobeOutput;
        const videoStream: FfprobeStream | undefined = data.streams.find(
          (s: FfprobeStream) => s.codec_type === 'video',
        );

        const height: number | undefined = videoStream?.height;
        const resolution: string | undefined = height != null ? getResolutionLabel(height) : undefined;
        const formatName: string = data.format.format_name ?? '';

        resolve({
          duration: Math.round(parseFloat(data.format.duration ?? '0')),
          fileSize: parseInt(data.format.size ?? '0', 10),
          mimeType: getMimeType(formatName),
          resolution,
        });
      });
    });
  }

  generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args: string[] = [
        '-i', videoPath,
        '-vf', 'select=gte(n\\,1),scale=640:-1',
        '-vframes', '1',
        '-y',
        outputPath,
      ];

      execFile('ffmpeg', args, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
