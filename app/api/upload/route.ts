import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const BUCKET = 'signage-assets';
const SLOT = 'primary_portrait';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mediaType = (formData.get('mediaType') as string) || (file.type.startsWith('video/') ? 'video' : 'image');
    const aspectRatio = (formData.get('aspect') as string) || '9:16';
    const fitMode = (formData.get('fitMode') as string) || 'cover';

    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceUrl || !serviceRole) {
      return NextResponse.json({ error: 'Server is missing upload credentials (SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 });
    }

    const service = createClient(serviceUrl, serviceRole, { auth: { persistSession: false } });

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