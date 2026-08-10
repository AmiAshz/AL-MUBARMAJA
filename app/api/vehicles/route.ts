import { NextResponse } from 'next/server';
import { getVehicles, createVehicle, DBVehicle } from '@/lib/db';

export async function GET() {
  try {
    const vehicles = getVehicles();
    vehicles.reverse(); 
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("GET Error", error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const dbVehicle: DBVehicle = {
      id: data.id,
      job_number: data.jobId,
      make: data.make,
      model: data.model,
      year: data.year,
      plate_number: data.plate,
      vin: data.vin,
      owner_name: data.ownerName,
      owner_phone: data.ownerPhone,
      date_brought_in: data.dateBroughtIn,
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inspection_findings: null,
      diagnosis: null,
      recommended_repairs: null,
      technician_notes: null,
      approval_status: null,
      estimate_parts_cost: null,
      estimate_labor_cost: null,
      estimate_notes: null,
      final_parts_cost: null,
      final_labor_cost: null,
      final_other_cost: null,
    };

    createVehicle(dbVehicle, data.complaints || [], data.initialLogNote || 'Vehicle received', data.photos || []);

    return NextResponse.json({ success: true, vehicle: dbVehicle });
  } catch (error) {
    console.error("POST Error", error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
