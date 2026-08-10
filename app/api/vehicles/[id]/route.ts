import { NextResponse } from 'next/server';
import { updateVehicleData, deleteVehicleRecord } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    
    const updates: any = {};
    if (data.status !== undefined) updates.status = data.status;
    if (data.make !== undefined) updates.make = data.make;
    if (data.model !== undefined) updates.model = data.model;
    if (data.year !== undefined) updates.year = data.year;
    if (data.plate !== undefined) updates.plate_number = data.plate;
    if (data.vin !== undefined) updates.vin = data.vin;
    if (data.ownerName !== undefined) updates.owner_name = data.ownerName;
    if (data.ownerPhone !== undefined) updates.owner_phone = data.ownerPhone;
    if (data.dateBroughtIn !== undefined) updates.date_brought_in = data.dateBroughtIn;
    
    // Diagnostics & Approval
    if (data.inspectionFindings !== undefined) updates.inspection_findings = data.inspectionFindings;
    if (data.diagnosis !== undefined) updates.diagnosis = data.diagnosis;
    if (data.recommendedRepairs !== undefined) updates.recommended_repairs = data.recommendedRepairs;
    if (data.technicianNotes !== undefined) updates.technician_notes = data.technicianNotes;
    if (data.approvalStatus !== undefined) updates.approval_status = data.approvalStatus;
    
    // Estimates
    if (data.estimatePartsCost !== undefined) updates.estimate_parts_cost = data.estimatePartsCost;
    if (data.estimateLaborCost !== undefined) updates.estimate_labor_cost = data.estimateLaborCost;
    if (data.estimateNotes !== undefined) updates.estimate_notes = data.estimateNotes;
    
    // Final Costs
    if (data.finalPartsCost !== undefined) updates.final_parts_cost = data.finalPartsCost;
    if (data.finalLaborCost !== undefined) updates.final_labor_cost = data.finalLaborCost;
    if (data.finalOtherCost !== undefined) updates.final_other_cost = data.finalOtherCost;

    updateVehicleData(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Error", error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    deleteVehicleRecord(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Error", error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
