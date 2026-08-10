import { NextResponse } from 'next/server';
import { addProgressLog } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { note, previousStatus, newStatus } = await req.json();
    addProgressLog(params.id, note, previousStatus || null, newStatus);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Logs Error", error);
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 });
  }
}
