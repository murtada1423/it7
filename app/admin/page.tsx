"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [mounted, setMounted] = useState(false);
  const [aspectMode, setAspectMode] = useState<"9:16" | "16:9" | "1:1" | "custom">("9:16");
  const [previewMode, setPreviewMode] = useState<"cover" | "contain" | "fill" | "scale-down" | "fit-to-page">("cover");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);

  // Upload functionality state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [fileBinary, setFileBinary] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const handleUpload = async () => {
    if (!fileBinary || !mediaType || !mediaUrl) {
      setUploadStatus('error');
      setUploadMessage('Please select a valid media file before broadcasting.');
      return;
    }
    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading asset to storage...');
      setUploadProgress(20);
      const extension = fileBinary.name.split('.').pop() || 'bin';
      const fileName = `media_${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('signage-assets').upload(fileName, fileBinary, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
      setUploadProgress(60);
      setUploadMessage('Generating public URL...');
      const { data: publicUrlData } = supabase.storage.from('signage-assets').getPublicUrl(fileName);
      if (!publicUrlData?.publicUrl) throw new Error('Failed to retrieve public URL for asset.');
      const publicUrl = publicUrlData.publicUrl;
      setUploadProgress(80);
      setUploadMessage('Broadcasting to active display...');
      const settings = JSON.parse(localStorage.getItem('signage_display_settings') || '{}');
      const { error: dbError } = await supabase.from('active_signage_state').update({ media_url: publicUrl, media_name: fileBinary.name, media_type: mediaType, mime_type: fileBinary.type, aspect_ratio: settings.mode ? settings.mode.replace(' Portrait', '').replace(' Landscape', '').replace(' Square', '').replace('Custom ', 'custom-') : '9:16', fit_mode: settings.fitMode || 'cover', updated_at: new Date().toISOString() }).eq('display_slot', 'primary_portrait');
      if (dbError) throw new Error(`Database update failed: ${dbError.message}`);
      setMediaUrl(publicUrl); // Update preview with public URL
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage('Broadcast active. All edge displays synchronized in real-time.');
      try {
        const bc = new BroadcastChannel('signage_sync');
        bc.postMessage({ type: 'settings_changed', settings: { mode: aspectMode, fitMode: previewMode, mediaUrl: mediaUrl } });
        bc.close();
      } catch {}
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      setUploadMessage(err.message || 'Unexpected error during broadcast.');
      setUploadProgress(0);
    }
  };

  // Dynamic responsive preview frame dimensions
  const getCanvasLayout = () => {
    if (aspectMode === "16:9") return { containerClass: "aspect-[16/9] max-w-[460px]", badgeText: "16:9 Landscape" };
    if (aspectMode === "1:1") return { containerClass: "aspect-square max-w-[320px]", badgeText: "1:1 Square" };
    if (aspectMode === "custom") return { containerClass: "", style: { width: customWidth, height: customHeight, maxWidth: '100vw', maxHeight: '100vh', aspectRatio: `${customWidth}/${customHeight}` }, badgeText: `Custom ${customWidth}x${customHeight}` };
    return { containerClass: "aspect-[9/16] max-w-[280px] sm:max-w-[320px]", badgeText: "9:16 Portrait" };
  };
  const layout = getCanvasLayout();

  return (
    <main className="w-screen h-screen max-h-screen bg-[#111111] text-white flex flex-col overflow-hidden select-none">
      {/* Top Navigation */}
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <h1 className="font-extrabold text-sm tracking-wider">
            IT7 CONTROL <span className="text-[10px] text-neutral-500 font-mono font-normal ml-1">ADMIN PANEL</span>
          </h1>
        </div>
        <a href="/display" target="_blank" rel="noopener noreferrer" className="text-xs border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-md transition bg-neutral-900/50 hover:bg-neutral-800">
          OPEN DISPLAY ↗
        </a>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-3.5rem)] overflow-hidden items-center">

        {/* Left Column: Broadcast Controls */}
        <div className="flex flex-col justify-center space-y-5 h-full overflow-y-auto pr-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Broadcast Media</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Upload video or image assets directly to the SIGNAGE storage bucket. Changes propagate instantly to all active vertical displays via WebSocket synchronization.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="border border-dashed border-neutral-700 rounded-xl p-6 bg-neutral-900/30 flex flex-col items-center justify-center hover:border-orange-500/50 transition cursor-pointer">
            <input
              id="media-upload"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = URL.createObjectURL(f);
                setMediaUrl(url);
                setFileBinary(f);
                setMediaType(f.type.startsWith('video/') ? 'video' : 'image');
                setUploadStatus('idle');
                setUploadMessage('');
              }}
            />
            <label htmlFor="media-upload" className="w-full flex flex-col items-center justify-center cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">↑</div>
              <p className="text-xs font-semibold text-neutral-300">Click to select media file</p>
              <p className="text-[10px] text-neutral-500 mt-1">Supported: .mp4, .webm, .mov, .jpg, .png, .webp</p>
            </label>
          </div>

          <button onClick={handleUpload} disabled={uploadStatus === 'uploading' || !mediaUrl} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition uppercase tracking-wider disabled:opacity-50">
            {uploadStatus === 'uploading' ? 'Broadcasting...' : uploadStatus === 'success' ? 'Broadcast Active' : 'Broadcast to Display'}
          </button>

          {/* Progress Indicator */}
          {uploadStatus !== 'idle' && (
            <div className="p-3 bg-neutral-900/40 rounded-lg border border-neutral-800/60">
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className={`mt-2 text-[11px] font-medium ${uploadStatus === 'error' ? 'text-rose-400' : uploadStatus === 'success' ? 'text-emerald-400' : 'text-neutral-400'}`}>{uploadMessage}</p>
            </div>
          )}

          {/* Settings */}
          <div className="pt-2 border-t border-neutral-800/50 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Display Settings</h3>
            <div className="flex items-center justify-between bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/80">
              <span className="text-xs text-neutral-300 font-medium">Aspect Ratio</span>
              <select value={aspectMode} onChange={(e) => {
                const val = e.target.value;
                setAspectMode(val as any);
                try {
                  const cfg = JSON.parse(localStorage.getItem('signage_display_settings') || '{}');
                  cfg.mode = val;
                  cfg.aspect = val.includes('16:9') ? '16/9' : val.includes('1:1') ? '1/1' : '9/16';
                  localStorage.setItem('signage_display_settings', JSON.stringify(cfg));
                  try { new BroadcastChannel('signage_sync').postMessage({ type: 'settings_changed', settings: cfg }); } catch {}
                  window.dispatchEvent(new Event('storage'));
                } catch {}
              }} className="bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-orange-500">
                <option value="9:16">Portrait 9:16 (1080x1920)</option>
                <option value="16:9">Landscape 16:9 (1920x1080)</option>
                <option value="1:1">Square 1:1 (1080x1080)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/80">
              <span className="text-xs text-neutral-300 font-medium">Preview Mode</span>
                <select value={previewMode} onChange={(e) => {
                  const val = e.target.value as any;
                  setPreviewMode(val);
                try {
                  const cfg = JSON.parse(localStorage.getItem('signage_display_settings') || '{}');
                  cfg.fitMode = val;
                  localStorage.setItem('signage_display_settings', JSON.stringify(cfg));
                  try { new BroadcastChannel('signage_sync').postMessage({ type: 'settings_changed', settings: cfg }); } catch {}
                  window.dispatchEvent(new Event('storage'));
                } catch {}
              }} className="bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-orange-500 ml-auto">
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="scale-down">Scale Down</option>
                <option value="fit-to-page">Fit To Page</option>
              </select>
            </div>

            {/* Custom Dimensions Input - only when Custom selected */}
            {aspectMode === "custom" && (
              <div className="flex items-center gap-3 bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/80">
                <span className="text-xs text-neutral-400 font-medium">أبعاد مخصصة:</span>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-24 bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-orange-500"
                  placeholder="Width"
                />
                <span className="text-neutral-500 text-xs">×</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-24 bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-orange-500"
                  placeholder="Height"
                />
                <button
                  onClick={() => {
                    const settings = { mode: 'custom', width: `${customWidth}px`, height: `${customHeight}px`, aspect: `${customWidth}:${customHeight}` };
                    localStorage.setItem('signage_display_settings', JSON.stringify(settings));
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="bg-neutral-700 hover:bg-neutral-600 text-xs font-bold px-3 py-1 rounded text-white transition"
                >
                  تأكيد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview Frame (Dynamic Responsive) */}
        <div className="h-full flex flex-col justify-center items-center overflow-hidden">
          <div className="w-full flex justify-between items-center mb-3 max-w-[320px]">
            <h3 className="text-base font-bold">Live Preview</h3>
            <span suppressHydrationWarning className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/80">{mounted ? aspectMode : "9:16"}</span>
          </div>

          <div className={`relative bg-neutral-950 rounded-2xl overflow-hidden border-4 border-neutral-800 shadow-2xl flex items-center justify-center transition-all duration-300 ease-in-out ${aspectMode === "custom" ? "w-full max-w-[320px]" : aspectMode.includes("16:9") ? "w-full max-w-[280px] sm:max-w-[320px] aspect-[16/9]" : aspectMode === "1:1" ? "w-full max-w-[280px] sm:max-w-[320px] aspect-square" : "w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16]"}`} style={aspectMode === "custom" ? { width: customWidth, height: customHeight, maxWidth: '320px', aspectRatio: `${customWidth}/${customHeight}` } : {}}>
            {mediaUrl ? (
              mediaType === 'video' ? (
                <video src={mediaUrl} className={`w-full h-full pointer-events-none scale-105 ${previewMode === 'cover' ? 'object-cover' : previewMode === 'contain' ? 'object-contain' : previewMode === 'fill' ? 'object-fill' : 'object-scale-down'}`} autoPlay loop muted playsInline />
              ) : (
                <img src={mediaUrl} alt="Live Preview" className={`w-full h-full pointer-events-none scale-105 ${previewMode === 'cover' ? 'object-cover' : previewMode === 'contain' ? 'object-contain' : previewMode === 'fill' ? 'object-fill' : 'object-scale-down'}`} />
              )
            ) : (
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">PREVIEW FRAME</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}











