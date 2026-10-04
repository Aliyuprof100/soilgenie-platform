import api from "../api/api";


export interface Farm {
  id: number;
  farm_id: string;

  farmer: number;
  farmer_name: string;

  registered_by: number | string;
  registered_by_name: string;

  farm_name: string;
  farm_size: number;

  primary_crop?: string | null;

  farming_type: string;
  irrigation_type: string;
  ownership_type: string;

  state: string;
  lga: string;
  ward?: string | null;
  village?: string | null;
  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  gps_accuracy?: number | null;

  status: string;

  created_at: string;
  updated_at: string;
}


export interface FarmFormData {
  farmer: number;

  farm_name: string;
  farm_size: string;

  primary_crop: string;

  farming_type: string;
  irrigation_type: string;
  ownership_type: string;

  state: string;
  lga: string;
  ward: string;
  village: string;
  address: string;

  latitude: string;
  longitude: string;
  gps_accuracy: string;
}


/*
|--------------------------------------------------------------------------
| CREATE FARM
|--------------------------------------------------------------------------
*/

export async function createFarm(
  data: FarmFormData
): Promise<Farm> {

  const response = await api.post(
    "/farms/",
    {
      ...data,

      farm_size:
        data.farm_size === ""
          ? null
          : Number(data.farm_size),

      latitude:
        data.latitude === ""
          ? null
          : Number(data.latitude),

      longitude:
        data.longitude === ""
          ? null
          : Number(data.longitude),

      gps_accuracy:
        data.gps_accuracy === ""
          ? null
          : Number(data.gps_accuracy),
    }
  );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| GET FARMS
|--------------------------------------------------------------------------
|
| The backend applies role-aware filtering:
|
| ADMIN  -> all farms
| AGENT  -> farms registered by the agent
| FARMER -> only farms belonging to the authenticated farmer
|
*/

export async function getFarms(): Promise<Farm[]> {

  const response = await api.get(
    "/farms/"
  );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| GET SINGLE FARM
|--------------------------------------------------------------------------
|
| Backend ownership rules prevent a farmer from retrieving another
| farmer's farm.
|
*/

export async function getFarm(
  id: number
): Promise<Farm> {

  const response = await api.get(
    `/farms/${id}/`
  );

  return response.data;
}