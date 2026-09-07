export type VehicleStatus = 
  | 'AWAITING_DIAGNOSIS'
  | 'IN_PROGRESS'
  | 'AWAITING_PARTS'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED';

export type ProgressLogType =
  | 'VEHICLE_RECEIVED'
  | 'INSPECTION'
  | 'DIAGNOSIS'
  | 'ESTIMATE_CREATED'
  | 'ESTIMATE_UPDATED'
  | 'APPROVAL'
  | 'REPAIR_STARTED'
  | 'REPAIR_COMPLETED'
  | 'ADDITIONAL_REPAIR'
  | 'STATUS_CHANGE'
  | 'PAYMENT'
  | 'NOTE'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED';

export interface ProgressNote {
  id: string;
  type: ProgressLogType;
  message: string;
  createdAt: string;
  user?: { name: string };
}

export type PhotoCategory = 
  | 'Vehicle Arrival'
  | 'Front'
  | 'Rear'
  | 'Left Side'
  | 'Right Side'
  | 'Interior'
  | 'Engine'
  | 'Damage'
  | 'Repair Progress'
  | 'Final Condition';

export interface VehiclePhoto {
  id: string;
  category: PhotoCategory;
  dataUrl: string;
  timestamp: string;
}

export interface AdditionalRepair {
  id: string;
  partsCost: number;
  laborCost: number;
  reason: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  description: string;
}

export interface Estimate {
  id: string;
  total: number;
  status: string;
}

export interface Vehicle {
  id: string;
  jobNumber: string; // Backend uses jobNumber instead of jobId
  make: string;
  model: string;
  year: string;
  plateNumber: string; // Backend uses plateNumber instead of plate
  vin: string | null;
  ownerName: string;
  ownerPhone: string;
  dateBroughtIn: string;
  
  complaints: Complaint[];
  status: VehicleStatus;
  progressLogs: ProgressNote[]; // Backend uses progressLogs instead of progressLog
  photos?: VehiclePhoto[]; // We will keep photos as is if we haven't built a robust photo backend
  
  estimates?: Estimate[];
  additionalRepairs?: AdditionalRepair[];
  
  inspections?: {
    findings: string | null;
    diagnosis: string | null;
    recommendation: string | null;
  }[];
  
  // Cost tracking
  finalTotalCost?: number | null;
  trackingCode?: string | null;
  notifications?: Notification[];
}

export interface Notification {
  id: string;
  phoneNumber: string;
  messageType: string;
  provider: string;
  status: string;
  providerMessageId?: string | null;
  sentAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
}
