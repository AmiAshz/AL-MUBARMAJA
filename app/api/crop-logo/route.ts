import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Remove the base64 prefix
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(process.cwd(), 'public', 'logo.png');
    fs.writeFileSync(filePath, buffer);

    console.log('[LOGO CROPPER] Logo successfully cropped and saved to public/logo.png');
    return NextResponse.json({ success: true, message: 'Logo cropped and saved successfully' });
  } catch (error: any) {
    console.error('[LOGO CROPPER] Error saving cropped logo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
