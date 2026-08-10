import { NextResponse } from 'next/server';
import { addPhotos } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { photos } = await req.json();
    if (photos && photos.length > 0) {
      addPhotos(params.id, photos);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Photos Error", error);
    return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 });
  }
}
