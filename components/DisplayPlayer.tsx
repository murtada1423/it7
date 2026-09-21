'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface SIGNAGEState {
  media_url: string;
  media_type: 'video' | 'image';
  media_name?: string;
  mime_type?: string;
  aspect_ratio?: string;
  fit_mode?: 'cover' | 'contain';
}

export default function DisplayPlayer() {
  const [mediaState, setMediaState] = useState<SIGNAGEState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // قراءة إعدادات العرض من localStorage
  const getDisplaySettings = () => {
    try {
      const raw = localStorage.getItem('signage_display_settings');
      return raw ? JSON.parse(raw) : { mode: 'portrait-9-16', width: '100vw', height: '100vh', aspect: '9/16' };
    } catch { return { mode: 'portrait-9-16', width: '100vw', height: '100vh', aspect: '9/16' }; }
  };

  const [displayConfig, setDisplayConfig] = useState(() => getDisplaySettings());
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill' | 'scale-down'>(() => {
    try {
      const raw = localStorage.getItem('signage_display_settings');
      const cfg = raw ? JSON.parse(raw) : {};
      return cfg.fitMode || 'cover';
    } catch { return 'cover'; }
  });

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const { data, error } = await supabase
          .from('active_signage_state')
          .select('media_url, media_type, media_name, mime_type, aspect_ratio, fit_mode')
          .eq('display_slot', 'primary_portrait')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Fetch error:', error);
        }

        if (data) {
          setMediaState({
            media_url: data.media_url,
            media_type: data.media_type,
            media_name: data.media_name,
            mime_type: data.mime_type,
            aspect_ratio: data.aspect_ratio || '9:16',
            fit_mode: data.fit_mode || 'cover',
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();

    const channel = supabase
      .channel('SIGNAGE_realtime_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_signage_state',
          filter: 'display_slot=eq.primary_portrait',
        },
        (payload) => {
          if (payload.new) {
            const newState = payload.new as Partial<SIGNAGEState>;
            setMediaState((prev) => ({
              ...prev,
              media_url: newState.media_url ?? prev?.media_url ?? '',
              media_type: (newState.media_type as 'video' | 'image') ?? prev?.media_type ?? 'video',
              media_name: newState.media_name ?? prev?.media_name,
              mime_type: newState.mime_type ?? prev?.mime_type,
              aspect_ratio: newState.aspect_ratio ?? prev?.aspect_ratio ?? '9:16',
              fit_mode: (newState.fit_mode as 'cover' | 'contain') ?? prev?.fit_mode ?? 'cover',
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fast polling fallback - only updates when media_url actually changes
  useEffect(() => {
    let lastUrl = mediaState?.media_url || '';
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('active_signage_state')
          .select('media_url, media_type, media_name, mime_type, aspect_ratio, fit_mode')
          .eq('display_slot', 'primary_portrait')
          .single();
        if (data && !error && data.media_url !== lastUrl) {
          lastUrl = data.media_url;
          setMediaState({
            media_url: data.media_url,
            media_type: data.media_type,
            media_name: data.media_name,
            mime_type: data.mime_type,
            aspect_ratio: data.aspect_ratio || '9:16',
            fit_mode: data.fit_mode || 'cover',
          });
        }
      } catch {}
    }, 100);
    return () => clearInterval(interval);
  }, [mediaState?.media_url]);

  useEffect(() => {
    try {
      const bc = new BroadcastChannel('signage_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'settings_changed') {
          setDisplayConfig(getDisplaySettings());
          try {
            const cfg = event.data?.settings || JSON.parse(localStorage.getItem('signage_display_settings') || '{}');
            setFitMode(cfg.fitMode || 'cover');
          } catch {}
        }
      };
      return () => bc.close();
    } catch {}
    return () => {};
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setDisplayConfig(getDisplaySettings());
      try {
        const raw = localStorage.getItem('signage_display_settings');
        const cfg = raw ? JSON.parse(raw) : {};
        setFitMode(cfg.fitMode || 'cover');
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    const poll = setInterval(() => {
      const cfgStr = localStorage.getItem('signage_display_settings');
      try {
        const cfg = cfgStr ? JSON.parse(cfgStr) : {};
        if (cfg.fitMode !== fitMode) setFitMode(cfg.fitMode || 'cover');
      } catch {}
    }, 200);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(poll);
    };
  }, [fitMode]);

  useEffect(() => {
    if (mediaState?.media_type === 'video' && videoRef.current && mediaState.media_url) {
      videoRef.current.load();
      const timer = setTimeout(() => {
        videoRef.current?.play().catch((err) => {
          console.warn('Autoplay blocked or interrupted:', err);
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [mediaState]);

  if (isLoading || !mediaState) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white animate-pulse">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">SIGNAGE</div>
          <div className="text-sm tracking-widest uppercase">Loading Display Payload...</div>
        </div>
      </div>
    );
  }

    const activeFit = fitMode || mediaState?.fit_mode || 'cover';
    const fitClass = activeFit === 'cover' ? 'object-cover' : activeFit === 'contain' ? 'object-contain' : activeFit === 'fill' ? 'object-fill' : activeFit === 'scale-down' ? 'object-scale-down' : 'object-fill';
    const activeAspect = mediaState?.aspect_ratio || displayConfig?.aspect || '9:16';

    const style = (() => {
      const ratio = activeAspect?.replace(':', '/') || '9/16';
      if (ratio === '16/9' || ratio === '16:9') return { width: '100vw', height: '56.25vw', maxHeight: '100vh', maxWidth: '177.77vh', margin: 'auto' };
      if (ratio === '1/1' || ratio === '1:1') return { width: '90vmin', height: '90vmin', maxWidth: '100vw', maxHeight: '100vh', margin: 'auto' };
      if (displayConfig.mode === 'custom' && displayConfig.width && displayConfig.height) return { width: displayConfig.width, height: displayConfig.height, maxWidth: '100vw', maxHeight: '100vh', margin: 'auto' };
      return { width: '100vw', height: '100vh' };
    })();

    return (
      <div className="bg-black overflow-hidden flex items-center justify-center relative" style={{ width: '100vw', height: '100vh' }}>
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" style={style}>
      {(() => {
        if (mediaState.media_type === 'video') {
          return (
            <video
              ref={videoRef}
              className={`w-full h-full pointer-events-none scale-105 ${fitClass}`}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={() => { videoRef.current?.play().catch(() => {}); }}
            >
              <source src={mediaState.media_url} type={mediaState.mime_type || 'video/mp4'} />
              Your browser does not support HTML5 video.
            </video>
          );
        } else {
          return (
            <img
              src={mediaState.media_url}
              alt={mediaState.media_name || 'Digital SIGNAGE Advertisement'}
              className={`w-full h-full pointer-events-none scale-105 ${fitClass}`}
              loading="eager"
              key={mediaState.media_url}
            />
          );
        }
      })()}

      </div>
    </div>
  );
}







