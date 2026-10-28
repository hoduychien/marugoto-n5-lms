'use client';

import React, { useRef, useState, useEffect, useId } from 'react';
import {
  Pause,
  RotateCcw,
  Volume2,
  MessageSquareQuote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { cn } from '@/lib/utils';

export type PlaybackSpeed = 1 | 0.75 | 0.5;

const SPEED_CYCLE: PlaybackSpeed[] = [1, 0.75, 0.5];

export interface AdvancedAudioPlayerProps {
  src: string;
  ttsText?: string;
  exampleTtsText?: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function AdvancedAudioPlayer({
  src,
  ttsText,
  exampleTtsText,
  label,
  compact = false,
  className,
}: AdvancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tooltipId = useId();

  const resolvedTtsText =
    ttsText || (src?.startsWith('tts:') ? src.slice(4) : '');
  const isTtsMode = Boolean(resolvedTtsText);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTtsTarget, setActiveTtsTarget] = useState<'word' | 'example'>(
    'word'
  );
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  const isWordPlaying =
    isPlaying && (!isTtsMode || activeTtsTarget === 'word');
  const isExamplePlaying =
    isPlaying && isTtsMode && activeTtsTarget === 'example';

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speed;
    }
  }, [src, resolvedTtsText]);

  const speakJapanese = (textToSpeak: string, target: 'word' | 'example') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setHasError(true);
      toast.error('Trình duyệt không hỗ trợ đọc văn bản tiếng Nhật');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = textToSpeak
      .replace(/～/g, '')
      .replace(/[（）()]/g, '')
      .replace(/／/g, '、')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = speed;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice =
      voices.find(
        (v) =>
          v.lang.toLowerCase().includes('ja') &&
          (v.name.includes('Nanami') ||
            v.name.includes('Haruka') ||
            v.name.includes('Google') ||
            v.name.includes('Kyoko') ||
            v.name.includes('Ichiro'))
      ) || voices.find((v) => v.lang.toLowerCase().includes('ja'));

    if (jpVoice) {
      utterance.voice = jpVoice;
    }

    utterance.onstart = () => {
      setActiveTtsTarget(target);
      setIsPlaying(true);
      setHasError(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setActiveTtsTarget(target);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isExamplePlaying) return;

    if (isTtsMode) {
      if (isPlaying && activeTtsTarget === 'word') {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
      } else {
        speakJapanese(resolvedTtsText, 'word');
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio || !src) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.playbackRate = speed;
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
      setHasError(true);
      toast.error('Không thể phát file âm thanh này');
    }
  };

  const handlePlayExample = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!exampleTtsText || isWordPlaying) return;

    if (isPlaying && activeTtsTarget === 'example') {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      speakJapanese(exampleTtsText, 'example');
    }
  };

  const handleRewind5s = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isTtsMode) {
      const targetText =
        activeTtsTarget === 'example' && exampleTtsText
          ? exampleTtsText
          : resolvedTtsText;
      speakJapanese(targetText, activeTtsTarget);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, audio.currentTime - 5);
    setCurrentTime(audio.currentTime);
  };

  const handleCycleSpeed = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const currentIndex = SPEED_CYCLE.indexOf(speed);
    const nextSpeed = SPEED_CYCLE[(currentIndex + 1) % SPEED_CYCLE.length];
    setSpeed(nextSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex flex-col gap-1.5',
        compact
          ? 'w-full'
          : 'w-full max-w-md rounded-lg border border-slate-200 bg-white p-2.5',
        className
      )}
    >
      {!isTtsMode && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onError={() => {
            setIsPlaying(false);
            setHasError(true);
          }}
        />
      )}

      {label && !compact && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 px-1">
          <Volume2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* 1. Nút Phát âm từ vựng / Play MP3 (Disable khi đang đọc câu ví dụ) */}
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={(!src && !isTtsMode) || hasError || isExamplePlaying}
            data-tooltip-id={tooltipId}
            data-tooltip-content={
              isExamplePlaying
                ? 'Đang đọc ví dụ...'
                : isWordPlaying
                ? 'Dừng phát âm'
                : 'Phát âm từ vựng'
            }
            aria-label="Play word audio"
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
              (!src && !isTtsMode) || hasError
                ? 'bg-slate-300'
                : isWordPlaying
                ? 'bg-indigo-700 ring-2 ring-indigo-200'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            )}
          >
            {isWordPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {/* 2. Nút Đọc câu ví dụ (Disable khi nút Phát âm từ vựng đang đọc) */}
          {isTtsMode && exampleTtsText && (
            <button
              type="button"
              onClick={handlePlayExample}
              disabled={isWordPlaying}
              data-tooltip-id={tooltipId}
              data-tooltip-content={
                isWordPlaying
                  ? 'Đang phát âm từ vựng...'
                  : isExamplePlaying
                  ? 'Dừng đọc ví dụ'
                  : 'Đọc câu ví dụ'
              }
              aria-label="Play example sentence"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all focus:outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
                isExamplePlaying
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
              )}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
            </button>
          )}

          {/* 3. Nút Nghe lại / Tua lùi 5s */}
          <button
            type="button"
            onClick={handleRewind5s}
            disabled={(!src && !isTtsMode) || hasError}
            data-tooltip-id={tooltipId}
            data-tooltip-content={
              isTtsMode ? 'Phát lại từ đầu' : 'Tua lùi 5 giây (-5s)'
            }
            aria-label="Replay or rewind 5 seconds"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-all focus:outline-none hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Thanh tiến trình (mỏng gọn, nút tròn nhỏ và tách thoáng số thời gian) */}
        {!compact && !isTtsMode && (
          <div className="flex flex-1 flex-col justify-center gap-2 px-2 pt-3.5">
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={!src || hasError || duration <= 0}
              style={{
                background:
                  duration > 0
                    ? `linear-gradient(to right, #4f46e5 ${
                        (currentTime / duration) * 100
                      }%, #e2e8f0 ${(currentTime / duration) * 100}%)`
                    : '#e2e8f0',
              }}
              className="audio-range-slider w-full cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] font-mono leading-none text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* 4. Nút chuyển đổi tốc độ: 1x -> 0.75x -> 0.5x */}
        <button
          type="button"
          onClick={handleCycleSpeed}
          disabled={(!src && !isTtsMode) || hasError}
          data-tooltip-id={tooltipId}
          data-tooltip-content="Đổi tốc độ đọc (1x → 0.75x → 0.5x)"
          aria-label={`Playback speed ${speed}x`}
          className={cn(
            'inline-flex h-8 min-w-[2.75rem] shrink-0 items-center justify-center rounded-lg border px-2 text-[11px] font-bold whitespace-nowrap transition-colors focus:outline-none disabled:opacity-50',
            speed === 1
              ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          )}
        >
          {speed}x
        </button>
      </div>

      {/* Component hiển thị Tooltip nhỏ gọn của react-tooltip */}
      <Tooltip
        id={tooltipId}
        place="top"
        offset={5}
        style={{
          padding: 0,
          fontSize: '11px',
          lineHeight: '1.3',
          borderRadius: '5px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          zIndex: 50,
        }}
      />
    </div>
  );
}
