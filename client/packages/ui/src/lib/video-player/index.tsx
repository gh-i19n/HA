/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef, useState } from 'react';
import { MainButton } from '../button';

// Format time (seconds to MM:SS)
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * A self-contained video player with hand-built controls (play/pause, a
 * click-to-seek progress bar, volume, fullscreen) instead of the browser's
 * native `<video controls>` UI, so the controls can match the rest of the
 * design system. Owns all playback state locally via a ref to the
 * underlying `<video>` element and mirrors it into React state for
 * rendering; also wires up space/m/f/arrow-key shortcuts while mounted.
 */
const CustomVideoPlayer = ({ src }: { src: string }) => {
  const videoReference = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update progress bar and current time
  const handleTimeUpdate = () => {
    if (videoReference.current) {
      const currentProgress =
        (videoReference.current.currentTime / videoReference.current.duration) *
        100;
      setProgress(currentProgress);
      setCurrentTime(videoReference.current.currentTime);
    }
  };

  // Set video duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoReference.current) {
      setDuration(videoReference.current.duration);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoReference.current) {
      if (isPlaying) {
        videoReference.current.pause();
      } else {
        videoReference.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (videoReference.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const pos = (event.clientX - rect.left) / rect.width;
      videoReference.current.currentTime =
        pos * videoReference.current.duration;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoReference.current) {
      videoReference.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(event.target.value);
    if (videoReference.current) {
      videoReference.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (videoReference.current) {
      if (isFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } else {
        if (videoReference.current.requestFullscreen) {
          videoReference.current.requestFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!videoReference.current) return;

      switch (event.key) {
        case ' ': {
          event.preventDefault();
          togglePlayPause();
          break;
        }
        case 'm': {
          toggleMute();
          break;
        }
        case 'f': {
          toggleFullscreen();
          break;
        }
        case 'ArrowLeft': {
          videoReference.current.currentTime -= 5;
          break;
        }
        case 'ArrowRight': {
          videoReference.current.currentTime += 5;
          break;
        }
        case 'ArrowUp': {
          videoReference.current.volume = Math.min(
            videoReference.current.volume + 0.1,
            1
          );
          setVolume(videoReference.current.volume);
          break;
        }
        case 'ArrowDown': {
          videoReference.current.volume = Math.max(
            videoReference.current.volume - 0.1,
            0
          );
          setVolume(videoReference.current.volume);
          break;
        }
        default: {
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isMuted, isFullscreen]);

  return (
    <div className="relative w-full max-w-7xl overflow-hidden rounded-lg bg-inverse-surface">
      {/* Video Element */}
      <video
        ref={videoReference}
        src={src}
        className="w-full rounded-lg"
        onClick={togglePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Custom Controls */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
        {/* Progress Bar */}
        <div
          className="relative mb-2 h-2 w-full cursor-pointer rounded-full bg-foreground-muted"
          onClick={handleProgressClick}
        >
          <div
            className="bg-primary absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-surface"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <MainButton
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-auto w-auto p-0 text-inverse-foreground shadow-none hover:bg-transparent hover:text-inverse-foreground focus:outline-none"
            >
              {isPlaying ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </MainButton>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2">
              <MainButton
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-auto w-auto p-0 text-inverse-foreground shadow-none hover:bg-transparent hover:text-inverse-foreground focus:outline-none"
              >
                {isMuted || volume === 0 ? (
                  <MuteIcon className="h-5 w-5" />
                ) : volume > 0.5 ? (
                  <HighVolumeIcon className="h-5 w-5" />
                ) : (
                  <LowVolumeIcon className="h-5 w-5" />
                )}
              </MainButton>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="accent-primary h-1 w-24 cursor-pointer appearance-none rounded-full bg-foreground-muted"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm text-inverse-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Fullscreen Button */}
          <MainButton
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-auto w-auto p-0 text-inverse-foreground shadow-none hover:bg-transparent hover:text-inverse-foreground focus:outline-none"
          >
            {isFullscreen ? (
              <ExitFullscreenIcon className="h-5 w-5" />
            ) : (
              <FullscreenIcon className="h-5 w-5" />
            )}
          </MainButton>
        </div>
      </div>
    </div>
  );
};

// Icon Components (replace with your actual icons)
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const MuteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const LowVolumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const HighVolumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const FullscreenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const ExitFullscreenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const VideoPlayerWithCustomControls = ({ url }: { url: string }) => {
  return (
    <div className="flex max-h-[700px] max-w-full items-center justify-center overflow-hidden rounded-md">
      <CustomVideoPlayer src={url} />
    </div>
  );
};
