import { supabase } from '@/app/lib/supabaseClient';
import { NextResponse } from 'next/server';


export async function DELETE(request: Request) {
    try {
      const { filePath } = await request.json();
  
      if (!filePath) {
        return NextResponse.json(
          { error: 'No file path provided' },
          { status: 400 }
        );
      }
  
      const { error } = await supabase.storage
        .from('maps')
        .remove([filePath]);
  
      if (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
          { error: 'Error deleting image' },
          { status: 500 }
        );
      }
  
      return NextResponse.json({ success: true });
  
    } catch (error) {
      console.error('Error in image deletion:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }