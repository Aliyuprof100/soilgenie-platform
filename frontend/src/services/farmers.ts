import api from "../api/api";


export interface Farmer {
  id: number;

  farmer_id: string;

  registered_by: string;
  registered_by_name: string;

  first_name: string;
  last_name: string;

  phone_number: string;
  alternative_phone?: string;
  email?: string;

  gender: string;
  date_of_birth?: string;

  state: string;
  lga: string;
  ward?: string;
  village?: string;
  address?: string;

  primary_crop?: string;

  farm_size?: number;

  number_of_farms: number;

  farming_type: string;

  status: string;

  created_at: string;
  updated_at: string;
}


export interface FarmerFormData {
  first_name: string;
  last_name: string;

  phone_number: string;
  alternative_phone: string;
  email: string;

  gender: string;
  date_of_birth: string;

  state: string;
  lga: string;
  ward: string;
  village: string;
  address: string;

  primary_crop: string;

  farm_size: string;

  number_of_farms: string;

  farming_type: string;
}


export interface FarmerStatistics {
  my_farmers_count: number;
  total_farmers_count: number;
}


/*
|--------------------------------------------------------------------------
| CREATE FARMER
|--------------------------------------------------------------------------
*/

export async function createFarmer(
  data: FarmerFormData
): Promise<Farmer> {

  const token =
    localStorage.getItem("access");


  const response = await api.post(
    "/farmers/",
    {
      ...data,

      farm_size:
        data.farm_size === ""
          ? null
          : Number(data.farm_size),

      number_of_farms:
        data.number_of_farms === ""
          ? 1
          : Number(data.number_of_farms),
    },
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );


  return response.data;
}


/*
|--------------------------------------------------------------------------
| GET MY FARMERS
|--------------------------------------------------------------------------
*/

export async function getMyFarmers(): Promise<Farmer[]> {

  const token =
    localStorage.getItem("access");


  const response = await api.get(
    "/farmers/",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );


  return response.data;
}


/*
|--------------------------------------------------------------------------
| GET ALL FARMERS
|--------------------------------------------------------------------------
|
| Alias used by the Farm Registration page.
|
*/

export async function getFarmers(): Promise<Farmer[]> {

  return getMyFarmers();

}


/*
|--------------------------------------------------------------------------
| GET SINGLE FARMER
|--------------------------------------------------------------------------
*/

export async function getFarmer(
  id: number
): Promise<Farmer> {

  const token =
    localStorage.getItem("access");


  const response = await api.get(
    `/farmers/${id}/`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );


  return response.data;
}


/*
|--------------------------------------------------------------------------
| FARMER STATISTICS
|--------------------------------------------------------------------------
*/

export async function getFarmerStatistics(): Promise<FarmerStatistics> {

  const token =
    localStorage.getItem("access");


  const response = await api.get(
    "/farmers/statistics/",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );


  return response.data;
}