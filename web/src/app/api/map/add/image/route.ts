import { supabase } from '@/app/lib/supabaseClient';
import { NextResponse } from 'next/server';

// // ✅ New runtime export
// export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const floorId = formData.get('floorId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and SVG are allowed' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = floorId ? `floor-${floorId}/${fileName}` : `temp/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('maps')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return NextResponse.json(
        { error: 'Error uploading image' },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('maps').getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      filePath,
    });

  } catch (error) {
    console.error('Error in image upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
