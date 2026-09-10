import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehiclePhoto } from './types';
import io from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || (typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/vehicles`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns: { success, data: { data: [...vehicles], meta: {...} } }
        setVehicles(Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : []);
        setIsLoaded(true);
      } else {
        console.error("Failed to fetch vehicles", res.status);
        if (res.status === 401 || res.status === 403) {
          if (typeof document !== 'undefined') document.cookie = 'token=; Max-Age=0; path=/;';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else {
          setIsLoaded(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch vehicles", e);
      setIsLoaded(true);
    }
  }, []);

  // Real-time updates using Socket.IO
  useEffect(() => {
    fetchVehicles();
    
    let socket: any = null;
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]) : null;
      if (BACKEND_URL && typeof window !== 'undefined') {
        socket = io(BACKEND_URL, {
          auth: { token },
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 2,
          timeout: 4000
        });
        
        socket.on('connect', () => {
          console.log('Connected to AL Mubarmaja real-time server');
        });

        const triggerUpdate = () => {
          fetchVehicles();
        };

        socket.on('vehicle:created', triggerUpdate);
        socket.on('vehicle:updated', triggerUpdate);
        socket.on('vehicle:deleted', triggerUpdate);
        socket.on('vehicle:statusChanged', triggerUpdate);
        socket.on('estimate:updated', triggerUpdate);
        socket.on('repair:updated', triggerUpdate);
        socket.on('progress:added', triggerUpdate);
        socket.on('payment:added', triggerUpdate);
      }
    } catch (err) {
      console.warn("Socket.io initialization skipped:", err);
    }

    return () => {
      if (socket) {
        try { socket.disconnect(); } catch {}
      }
    };
  }, [fetchVehicles]);

  const addVehicle = async (vehicleData: any) => {
    try {
      const res = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          make: vehicleData.make,
          model: vehicleData.model,
          year: String(vehicleData.year || new Date().getFullYear()),
          plateNumber: vehicleData.plateNumber,
          vin: vehicleData.vin,
          ownerName: vehicleData.ownerName,
          ownerPhone: vehicleData.ownerPhone,
          dateBroughtIn: vehicleData.dateBroughtIn || new Date().toISOString().split('T')[0],
          status: vehicleData.status || 'AWAITING_DIAGNOSIS',
          complaints: (vehicleData.complaints || []).map((c: any) => (typeof c === 'string' ? c : c?.description || ''))
        })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) {
        fetchVehicles();
        return data.data;
      }
      const errorMsg = data?.message || `Failed to register vehicle (Status: ${res.status})`;
      throw new Error(errorMsg);
    } catch (e) {
      console.error("addVehicle error:", e);
      throw e;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      await fetch(`${API_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const updateVehicleStatus = async (id: string, status: string, lang: string = 'ar') => {
    try {
      await fetch(`${API_URL}/vehicles/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, lang })
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  }

  const addProgressNote = async (id: string, message: string, isCustomerVisible: boolean = false) => {
    try {
      await fetch(`${API_URL}/vehicles/${id}/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: 'NOTE', message, isCustomerVisible })
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const addPhoto = async (id: string, photoData: Omit<VehiclePhoto, 'id' | 'timestamp'>) => {
    // Keep local for MVP unless a photo endpoint is added
    console.warn("Photo upload not fully supported by backend yet.");
  };

  const addAdditionalRepair = async (id: string, partsCost: number, laborCost: number, reason: string) => {
    try {
      await fetch(`${API_URL}/additional-repairs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vehicleId: id, partsCost, laborCost, reason })
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await fetch(`${API_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const createEstimate = async (id: string, partsTotal: number, laborTotal: number) => {
    try {
      await fetch(`${API_URL}/estimates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vehicleId: id,
          items: [
            { itemType: 'PART', description: 'Parts', quantity: 1, unitPrice: partsTotal },
            { itemType: 'LABOR', description: 'Labor', quantity: 1, unitPrice: laborTotal }
          ],
          isCustomerVisible: false // default false until sent
        })
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const updateFinalCost = async (id: string, finalPartsCost: number, finalLaborCost: number, finalOtherCost: number) => {
    try {
      await fetch(`${API_URL}/vehicles/${id}/final-cost`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finalPartsCost,
          finalLaborCost,
          finalOtherCost,
          finalTax: (finalPartsCost + finalLaborCost + finalOtherCost) * 0.18 // basic tax logic
        })
      });
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const addPayment = async (id: string, paymentData: { amount: number; paymentMethod: string; reference?: string }) => {
    try {
      const res = await fetch(`${API_URL}/vehicles/${id}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      if (res.ok) {
        fetchVehicles();
        return res;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const markWhatsappAsSent = async (id: string, type: string) => {
    try {
      const res = await fetch(`${API_URL}/vehicles/${id}/whatsapp-notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        fetchVehicles();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resendTrackingMessage = async (id: string) => {
    return markWhatsappAsSent(id, 'TRACKING_DETAILS');
  };

  const regenerateTrackingCode = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/vehicles/${id}/tracking/regenerate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchVehicles();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resendCompletionMessage = async (id: string) => {
    return markWhatsappAsSent(id, 'REPAIR_COMPLETED');
  };

  return { 
    vehicles, 
    isLoaded, 
    addVehicle, 
    updateVehicle,
    updateVehicleStatus, 
    addProgressNote, 
    addPhoto, 
    addAdditionalRepair, 
    deleteVehicle,
    createEstimate,
    updateFinalCost,
    addPayment,
    resendTrackingMessage,
    regenerateTrackingCode,
    resendCompletionMessage,
    markWhatsappAsSent
  };
}
