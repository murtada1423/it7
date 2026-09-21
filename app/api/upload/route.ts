import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const BUCKET = 'signage-assets';
const SLOT = 'primary_portrait';

function getService() {
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceRole) return null;
  return createClient(serviceUrl, serviceRole, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const service = getService();
    if (!service) {
      return NextResponse.json({ error: 'Server is missing upload credentials (SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';

    // --- Mode 1: JSON "prepare" -> issue a signed upload URL so the browser
    //     uploads the video directly to Supabase (bypasses the 4.5MB Vercel cap).
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const action = body?.action;

      if (action === 'prepare') {
        const name: string = body.name || `media_${Date.now()}.bin`;
        const ext = name.split('.').pop() || 'bin';
        const fileName = `media_${Date.now()}.${ext}`;
        const { data, error } = await service.storage.from(BUCKET).createSignedUploadUrl(fileName, {
          contentType: body.contentType || 'application/octet-stream',
          upsert: false,
        });
        if (error || !data) {
          return NextResponse.json({ error: `Could not create upload URL: ${error?.message}` }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          action: 'prepare',
          fileName,
          uploadUrl: data.signedUrl,
          token: data.token,
        });
      }

      if (action === 'finalize') {
        const fileName: string = body.fileName;
        const mediaName: string = body.mediaName || fileName;
        const { data: publicUrlData } = service.storage.from(BUCKET).getPublicUrl(fileName);
        if (!publicUrlData?.publicUrl) {
          return NextResponse.json({ error: 'Failed to build public URL for asset' }, { status: 500 });
        }
        const { error: dbError } = await service
          .from('active_signage_state')
          .update({
            media_url: publicUrlData.publicUrl,
            media_name: mediaName,
            media_type: body.mediaType || 'video',
            mime_type: body.mimeType || 'application/octet-stream',
            aspect_ratio: body.aspect || '9:16',
            fit_mode: body.fitMode || 'cover',
            updated_at: new Date().toISOString(),
          })
          .eq('display_slot', SLOT);
        if (dbError) {
          return NextResponse.json({ error: `Database update failed: ${dbError.message}` }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: 'finalize', mediaUrl: publicUrlData.publicUrl });
      }

      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // --- Mode 2: multipart (small files) - direct server-side upload.
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mediaType = (formData.get('mediaType') as string) || (file.type.startsWith('video/') ? 'video' : 'image');
    const aspectRatio = (formData.get('aspect') as string) || '9:16';
    const fitMode = (formData.get('fitMode') as string) || 'cover';

    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `media_${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await service.storage.from(BUCKET).upload(fileName, bytes, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });
    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = service.storage.from(BUCKET).getPublicUrl(fileName);
    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: 'Failed to build public URL for asset' }, { status: 500 });
    }

    const { error: dbError } = await service
      .from('active_signage_state')
      .update({
        media_url: publicUrlData.publicUrl,
        media_name: file.name,
        media_type: mediaType,
        mime_type: file.type,
        aspect_ratio: aspectRatio,
        fit_mode: fitMode,
        updated_at: new Date().toISOString(),
      })
      .eq('display_slot', SLOT);
    if (dbError) {
      return NextResponse.json({ error: `Database update failed: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, mediaUrl: publicUrlData.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected upload error' }, { status: 500 });
  }
}