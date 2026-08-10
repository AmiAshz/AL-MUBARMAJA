import { NextResponse } from 'next/server';
import { addAdditionalRepair } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { partsCost, laborCost, reason } = await req.json();
    const repair = addAdditionalRepair(params.id, partsCost, laborCost, reason);
    return NextResponse.json({ success: true, repair });
  } catch (error) {
    console.error("POST Repairs Error", error);
    return NextResponse.json({ error: 'Failed to add repair' }, { status: 500 });
  }
}
