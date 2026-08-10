import fs from 'fs';
import path from 'path';

export interface DBVehicle {
  id: string;
  job_number: string;
  make: string;
  model: string;
  year: string;
  plate_number: string;
  vin: string;
  owner_name: string;
  owner_phone: string;
  date_brought_in: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Diagnostics & Approval
  inspection_findings: string | null;
  diagnosis: string | null;
  recommended_repairs: string | null;
  technician_notes: string | null;
  approval_status: string | null;
  
  // Costs
  estimate_parts_cost: number | null;
  estimate_labor_cost: number | null;
  estimate_notes: string | null;
  
  final_parts_cost: number | null;
  final_labor_cost: number | null;
  final_other_cost: number | null;
}

export interface DBComplaint {
  id: string;
  vehicle_id: string;
  complaint: string;
  created_at: string;
}

export interface DBProgressLog {
  id: string;
  vehicle_id: string;
  note: string;
  previous_status: string | null;
  new_status: string;
  created_at: string;
}

export interface DBPhoto {
  id: string;
  vehicle_id: string;
  category: string;
  data_url: string;
  created_at: string;
}

export interface DBAdditionalRepair {
  id: string;
  vehicle_id: string;
  parts_cost: number;
  labor_cost: number;
  reason: string;
  created_at: string;
}

interface DBSchema {
  vehicles: DBVehicle[];
  complaints: DBComplaint[];
  progress_logs: DBProgressLog[];
  photos: DBPhoto[];
  additional_repairs: DBAdditionalRepair[];
}

const DB_PATH = path.join(process.cwd(), 'vantara_db_v2.json');

const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DBSchema = {
      vehicles: [],
      complaints: [],
      progress_logs: [],
      photos: [],
      additional_repairs: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

const readDB = (): DBSchema => {
  initDB();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data: DBSchema) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

export const getVehicles = () => {
  const db = readDB();
  return db.vehicles.map(v => ({
    id: v.id,
    jobId: v.job_number,
    make: v.make,
    model: v.model,
    year: v.year,
    plate: v.plate_number,
    vin: v.vin,
    ownerName: v.owner_name,
    ownerPhone: v.owner_phone,
    dateBroughtIn: v.date_brought_in,
    status: v.status,
    
    inspectionFindings: v.inspection_findings,
    diagnosis: v.diagnosis,
    recommendedRepairs: v.recommended_repairs,
    technicianNotes: v.technician_notes,
    approvalStatus: v.approval_status as any,
    
    estimatePartsCost: v.estimate_parts_cost,
    estimateLaborCost: v.estimate_labor_cost,
    estimateNotes: v.estimate_notes,
    
    finalPartsCost: v.final_parts_cost,
    finalLaborCost: v.final_labor_cost,
    finalOtherCost: v.final_other_cost,
    
    complaints: db.complaints.filter(c => c.vehicle_id === v.id).map(c => c.complaint),
    
    additionalRepairs: db.additional_repairs.filter(r => r.vehicle_id === v.id).map(r => ({
      id: r.id,
      partsCost: r.parts_cost,
      laborCost: r.labor_cost,
      reason: r.reason,
      timestamp: r.created_at
    })),
    
    progressLog: db.progress_logs.filter(p => p.vehicle_id === v.id).map(p => {
      const d = new Date(p.created_at);
      return {
        id: p.id,
        date: d.toISOString().split('T')[0],
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: p.note
      };
    }),
    
    photos: db.photos.filter(p => p.vehicle_id === v.id).map(p => ({
      id: p.id,
      category: p.category,
      dataUrl: p.data_url,
      timestamp: p.created_at
    }))
  }));
};

export const createVehicle = (
  vehicle: DBVehicle, 
  complaints: string[], 
  initialLogNote: string, 
  photos: { id: string, category: string, dataUrl: string, timestamp: string }[]
) => {
  const db = readDB();
  db.vehicles.push(vehicle);
  
  complaints.forEach(c => {
    db.complaints.push({
      id: crypto.randomUUID(),
      vehicle_id: vehicle.id,
      complaint: c,
      created_at: new Date().toISOString()
    });
  });

  db.progress_logs.push({
    id: crypto.randomUUID(),
    vehicle_id: vehicle.id,
    note: initialLogNote,
    previous_status: null,
    new_status: vehicle.status,
    created_at: new Date().toISOString()
  });

  photos.forEach(p => {
    db.photos.push({
      id: p.id,
      vehicle_id: vehicle.id,
      category: p.category,
      data_url: p.dataUrl,
      created_at: p.timestamp
    });
  });

  writeDB(db);
};

export const updateVehicleData = (id: string, updates: Partial<DBVehicle>) => {
  const db = readDB();
  const index = db.vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    db.vehicles[index] = { ...db.vehicles[index], ...updates, updated_at: new Date().toISOString() };
    writeDB(db);
  }
};

export const addProgressLog = (vehicleId: string, note: string, prevStatus: string | null, newStatus: string) => {
  const db = readDB();
  db.progress_logs.push({
    id: crypto.randomUUID(),
    vehicle_id: vehicleId,
    note,
    previous_status: prevStatus,
    new_status: newStatus,
    created_at: new Date().toISOString()
  });
  writeDB(db);
};

export const addPhotos = (vehicleId: string, photos: { category: string, dataUrl: string }[]) => {
  const db = readDB();
  photos.forEach(p => {
    db.photos.push({
      id: crypto.randomUUID(),
      vehicle_id: vehicleId,
      category: p.category,
      data_url: p.dataUrl,
      created_at: new Date().toISOString()
    });
  });
  writeDB(db);
};

export const addAdditionalRepair = (vehicleId: string, partsCost: number, laborCost: number, reason: string) => {
  const db = readDB();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  db.additional_repairs.push({
    id,
    vehicle_id: vehicleId,
    parts_cost: partsCost,
    labor_cost: laborCost,
    reason,
    created_at: timestamp
  });
  writeDB(db);
  return { id, timestamp };
};

export const deleteVehicleRecord = (id: string) => {
  const db = readDB();
  db.vehicles = db.vehicles.filter(v => v.id !== id);
  db.complaints = db.complaints.filter(c => c.vehicle_id !== id);
  db.progress_logs = db.progress_logs.filter(p => p.vehicle_id !== id);
  db.photos = db.photos.filter(p => p.vehicle_id !== id);
  db.additional_repairs = db.additional_repairs.filter(r => r.vehicle_id !== id);
  writeDB(db);
};
