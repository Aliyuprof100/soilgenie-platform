import api from "../api/api";


/* ==========================================================================
   TYPES
   ========================================================================== */

/**
 * Sampling Zone
 */
export interface SamplingZone {
  id: number;

  farm: number;
  farm_id: string;
  farm_name: string;

  name: string;
  description?: string | null;
  crop?: string | null;

  area_hectares?: number | null;

  latitude?: number | null;
  longitude?: number | null;

  status: "ACTIVE" | "INACTIVE";

  created_at: string;
  updated_at: string;
}


/**
 * Soil Sample
 */
export interface SoilSample {
  id: number;
  sample_id: string;

  farm: number;
  farm_id: string;
  farm_name: string;

  sampling_zone?: number | null;
  sampling_zone_name?: string | null;

  collected_by?: number | null;
  collected_by_name?: string | null;

  collection_method:
    | "MANUAL"
    | "SENSOR"
    | "LAB";

  collection_date: string;

  sampling_depth_cm?: number | null;

  latitude?: number | null;
  longitude?: number | null;

  gps_accuracy?: number | null;

  notes?: string | null;

  status:
    | "COLLECTED"
    | "RECEIVED"
    | "TESTING"
    | "TESTED"
    | "REJECTED";

  created_at: string;
  updated_at: string;
}


/**
 * Soil Sample creation payload
 */
export interface CreateSoilSamplePayload {
  farm: number;

  sampling_zone?: number | null;

  collection_method:
    | "MANUAL"
    | "SENSOR"
    | "LAB";

  collection_date?: string | null;

  sampling_depth_cm?: number | null;

  latitude?: number | null;
  longitude?: number | null;

  gps_accuracy?: number | null;

  notes?: string | null;
}


/* ==========================================================================
   SOIL TEST TYPES
   ========================================================================== */

/**
 * Soil Test
 */
export interface SoilTest {
  id: number;

  test_id: string;

  sample: number;
  sample_id: string;

  farm_name: string;

  test_method:
    | "SOILGENIE_SENSOR"
    | "LABORATORY"
    | "MANUAL";

  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

  tested_at?: string | null;

  notes?: string | null;

  result?: SoilTestResult | null;

  created_at: string;
  updated_at: string;
}


/**
 * Soil Test creation payload
 */
export interface CreateSoilTestPayload {
  sample: number;

  test_method:
    | "SOILGENIE_SENSOR"
    | "LABORATORY"
    | "MANUAL";

  notes?: string | null;
}


/* ==========================================================================
   SOIL TEST RESULT
   ========================================================================== */

/**
 * Measured soil parameters.
 */
export interface SoilTestResult {
  id: number;

  test: number;

  ph?: number | null;

  nitrogen_mg_kg?: number | null;

  phosphorus_mg_kg?: number | null;

  potassium_mg_kg?: number | null;

  moisture_percent?: number | null;

  electrical_conductivity_ds_m?: number | null;

  organic_matter_percent?: number | null;

  temperature_celsius?: number | null;

  created_at: string;
  updated_at: string;
}


/**
 * Soil Test Result creation payload.
 */
export interface CreateSoilTestResultPayload {
  test: number;

  ph?: number | null;

  nitrogen_mg_kg?: number | null;

  phosphorus_mg_kg?: number | null;

  potassium_mg_kg?: number | null;

  moisture_percent?: number | null;

  electrical_conductivity_ds_m?: number | null;

  organic_matter_percent?: number | null;

  temperature_celsius?: number | null;
}


/* ==========================================================================
   SOIL RECOMMENDATION TYPES
   ========================================================================== */

/**
 * Measurement validation status.
 *
 * `string` is intentionally included so the frontend remains
 * forward-compatible if the backend adds another status later.
 */
export type MeasurementStatus =
  | "VALID"
  | "MISSING"
  | "WARNING"
  | "CRITICAL"
  | string;


/**
 * Measurement validation severity.
 */
export type MeasurementSeverity =
  | "NORMAL"
  | "UNKNOWN"
  | "WARNING"
  | "CRITICAL"
  | string;


/**
 * Validation information for one soil measurement.
 */
export interface MeasurementValidationItem {
  parameter: string;

  value?: number | null;

  status: MeasurementStatus;

  severity: MeasurementSeverity;

  message?: string | null;
}


/**
 * Complete measurement-quality assessment.
 */
export interface MeasurementValidation {
  overall_status:
    | "VALID"
    | "WARNING"
    | "CRITICAL"
    | "INCOMPLETE"
    | string;

  recommendation_blocked: boolean;

  recommendation_status:
    | "AVAILABLE"
    | "LIMITED"
    | "BLOCKED"
    | string;

  summary: string;

  measurements: Record<
    string,
    MeasurementValidationItem
  >;

  critical_measurements: MeasurementValidationItem[];

  warning_measurements: MeasurementValidationItem[];

  missing_measurements: MeasurementValidationItem[];
}


/**
 * Farmer-readable interpretation of soil conditions.
 */
export interface SoilConditions {
  strengths: string[];

  limitations: string[];

  risks: string[];

  actions: string[];
}


/**
 * Crop suitability classification.
 */
export type CropSuitability =
  | "HIGHLY_SUITABLE"
  | "SUITABLE"
  | "CONDITIONAL"
  | "MARGINAL"
  | "CRITICAL_CONSTRAINT"
  | "UNSUITABLE"
  | string;


/**
 * Crop recommendation decision.
 */
export type CropDecision =
  | "RECOMMEND"
  | "CONDITIONAL"
  | "HOLD"
  | "DO_NOT_RECOMMEND"
  | "VERIFY_MEASUREMENTS"
  | string;


/**
 * Confidence attached to a crop recommendation.
 */
export type RecommendationConfidence =
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | string;


/**
 * One crop recommendation returned by SoilGenie.
 */
export interface CropRecommendation {
  crop: string;

  score: number;

  decision: CropDecision;

  confidence: RecommendationConfidence;

  suitability: CropSuitability;

  reason?: string | null;

  critical_constraints: string[];

  warnings: string[];

  strengths: string[];

  automatic_recommendation: boolean;

  provisional: boolean;
}


/**
 * Crops grouped according to the final
 * SoilGenie recommendation decision.
 */
export interface CropRecommendationGroups {
  recommended: CropRecommendation[];

  conditional: CropRecommendation[];

  hold: CropRecommendation[];

  avoid: CropRecommendation[];
}


/**
 * Complete response from:
 *
 * GET /api/soil/results/<resultId>/recommendation/
 */
export interface SoilRecommendation {
  result_id: string;

  sample_id: string;

  test_id: string;

  measurement_validation: MeasurementValidation;

  best_crop?: string | null;

  provisional_best_crop?: string | null;

  soil_conditions: SoilConditions;

  crop_recommendations: CropRecommendationGroups;

  farmer_summary: string;
}


/* ==========================================================================
   SOIL ANALYSIS
   ========================================================================== */

export type SoilAnalysisSeverity =
  | "GOOD"
  | "MODERATE"
  | "POOR"
  | "CRITICAL";


export interface SoilAnalysis {
  id: number;

  test: number;

  test_id: string;

  sample_id: string;

  overall_status: SoilAnalysisSeverity;

  summary?: string | null;

  ph_status?: string | null;

  nitrogen_status?: string | null;

  phosphorus_status?: string | null;

  potassium_status?: string | null;

  moisture_status?: string | null;

  organic_matter_status?: string | null;

  recommendations?: string | null;

  fertilizer_recommendation?: string | null;

  amendment_recommendation?: string | null;

  irrigation_recommendation?: string | null;

  crop_recommendation?: string | null;

  generated_by?: string | null;

  created_at: string;

  updated_at: string;
}


export interface CreateSoilAnalysisPayload {
  test: number;

  overall_status?: SoilAnalysisSeverity;

  summary?: string | null;

  ph_status?: string | null;

  nitrogen_status?: string | null;

  phosphorus_status?: string | null;

  potassium_status?: string | null;

  moisture_status?: string | null;

  organic_matter_status?: string | null;

  recommendations?: string | null;

  fertilizer_recommendation?: string | null;

  amendment_recommendation?: string | null;

  irrigation_recommendation?: string | null;

  crop_recommendation?: string | null;

  generated_by?: string | null;
}


/* ==========================================================================
   API ERROR HANDLING
   ========================================================================== */

function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      status?: number;
      data?: unknown;
    };
    message?: string;
  };

  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;

  console.error("SoilGenie API error:", {
    status,
    data,
    error,
  });

  if (!data) {
    return (
      axiosError?.message ||
      "Unable to connect to the SoilGenie server. Please check that the backend server is running."
    );
  }

  if (status === 401) {
    return "Your session has expired or you are not authenticated. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested SoilGenie resource could not be found.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const responseData = data as Record<string, unknown>;

    if (typeof responseData.detail === "string") {
      return responseData.detail;
    }

    const messages: string[] = [];

    Object.entries(responseData).forEach(
      ([field, value]) => {
        if (
          value === null ||
          value === undefined
        ) {
          return;
        }

        if (Array.isArray(value)) {
          const fieldMessages = value
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              if (
                item &&
                typeof item === "object"
              ) {
                return JSON.stringify(item);
              }

              return String(item);
            })
            .join(", ");

          messages.push(
            `${formatFieldName(field)}: ${fieldMessages}`
          );

          return;
        }

        if (typeof value === "string") {
          messages.push(
            `${formatFieldName(field)}: ${value}`
          );

          return;
        }

        if (typeof value === "object") {
          messages.push(
            `${formatFieldName(field)}: ${JSON.stringify(
              value
            )}`
          );

          return;
        }

        messages.push(
          `${formatFieldName(field)}: ${String(
            value
          )}`
        );
      }
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return "The server rejected the request. Please check the information and try again.";
}


function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


/* ==========================================================================
   AUTHORIZATION
   ========================================================================== */

function getAuthHeaders() {
  const token = localStorage.getItem("access");

  if (!token) {
    console.warn(
      "SoilGenie: No access token found."
    );
  }

  return {
    Authorization: token
      ? `Bearer ${token}`
      : "",
  };
}


/* ==========================================================================
   SAMPLING ZONES
   ========================================================================== */

export async function getSamplingZones(
  farmId: number
): Promise<SamplingZone[]> {
  try {
    const response =
      await api.get<SamplingZone[]>(
        `/soil/zones/?farm=${farmId}`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load sampling zones:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSamplingZone(
  id: number
): Promise<SamplingZone> {
  try {
    const response =
      await api.get<SamplingZone>(
        `/soil/zones/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load sampling zone:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


/* ==========================================================================
   SOIL SAMPLES
   ========================================================================== */

export async function createSoilSample(
  data: CreateSoilSamplePayload
): Promise<SoilSample> {
  try {
    const payload: CreateSoilSamplePayload = {
      farm: data.farm,
      sampling_zone:
        data.sampling_zone ?? null,
      collection_method:
        data.collection_method,
      collection_date:
        data.collection_date ?? null,
      sampling_depth_cm:
        data.sampling_depth_cm ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      gps_accuracy:
        data.gps_accuracy ?? null,
      notes: data.notes ?? null,
    };

    console.log(
      "Creating soil sample with payload:",
      payload
    );

    const response =
      await api.post<SoilSample>(
        "/soil/samples/",
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil sample created successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to create soil sample:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilSamples(
  farmId?: number,
  status?: string
): Promise<SoilSample[]> {
  try {
    const params =
      new URLSearchParams();

    if (farmId !== undefined) {
      params.append(
        "farm",
        String(farmId)
      );
    }

    if (status) {
      params.append(
        "status",
        status
      );
    }

    const query = params.toString();

    const response =
      await api.get<SoilSample[]>(
        `/soil/samples/${
          query ? `?${query}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil samples:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilSample(
  id: number
): Promise<SoilSample> {
  try {
    const response =
      await api.get<SoilSample>(
        `/soil/samples/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil sample:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


/* ==========================================================================
   SOIL TESTS
   ========================================================================== */

export async function createSoilTest(
  data: CreateSoilTestPayload
): Promise<SoilTest> {
  try {
    const payload: CreateSoilTestPayload = {
      sample: data.sample,
      test_method: data.test_method,
      notes: data.notes ?? null,
    };

    console.log(
      "Creating soil test with payload:",
      payload
    );

    const response =
      await api.post<SoilTest>(
        "/soil/tests/",
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil test created successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to create soil test:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilTests(
  sampleId?: number,
  status?: string
): Promise<SoilTest[]> {
  try {
    const params =
      new URLSearchParams();

    if (sampleId !== undefined) {
      params.append(
        "sample",
        String(sampleId)
      );
    }

    if (status) {
      params.append(
        "status",
        status
      );
    }

    const query = params.toString();

    const response =
      await api.get<SoilTest[]>(
        `/soil/tests/${
          query ? `?${query}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil tests:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilTest(
  id: number
): Promise<SoilTest> {
  try {
    const response =
      await api.get<SoilTest>(
        `/soil/tests/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil test:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function updateSoilTest(
  id: number,
  data: Partial<CreateSoilTestPayload>
): Promise<SoilTest> {
  try {
    const response =
      await api.patch<SoilTest>(
        `/soil/tests/${id}/`,
        data,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to update soil test:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


/* ==========================================================================
   SOIL TEST RESULTS
   ========================================================================== */

export async function createSoilTestResult(
  data: CreateSoilTestResultPayload
): Promise<SoilTestResult> {
  try {
    const payload: CreateSoilTestResultPayload = {
      test: data.test,
      ph: data.ph ?? null,
      nitrogen_mg_kg:
        data.nitrogen_mg_kg ?? null,
      phosphorus_mg_kg:
        data.phosphorus_mg_kg ?? null,
      potassium_mg_kg:
        data.potassium_mg_kg ?? null,
      moisture_percent:
        data.moisture_percent ?? null,
      electrical_conductivity_ds_m:
        data.electrical_conductivity_ds_m ??
        null,
      organic_matter_percent:
        data.organic_matter_percent ??
        null,
      temperature_celsius:
        data.temperature_celsius ??
        null,
    };

    console.log(
      "Creating soil test result with payload:",
      payload
    );

    const response =
      await api.post<SoilTestResult>(
        "/soil/results/",
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil test result created successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to create soil test result:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilTestResults(
  testId?: number
): Promise<SoilTestResult[]> {
  try {
    const params =
      new URLSearchParams();

    if (testId !== undefined) {
      params.append(
        "test",
        String(testId)
      );
    }

    const query = params.toString();

    const response =
      await api.get<SoilTestResult[]>(
        `/soil/results/${
          query ? `?${query}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil test results:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilTestResult(
  id: number
): Promise<SoilTestResult> {
  try {
    const response =
      await api.get<SoilTestResult>(
        `/soil/results/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil test result:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function updateSoilTestResult(
  id: number,
  data: Partial<CreateSoilTestResultPayload>
): Promise<SoilTestResult> {
  try {
    const response =
      await api.patch<SoilTestResult>(
        `/soil/results/${id}/`,
        data,
        {
          headers: getAuthHeaders(),
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to update soil test result:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


/* ==========================================================================
   SOIL RECOMMENDATIONS
   ========================================================================== */

/**
 * Load the complete SoilGenie decision-support recommendation
 * for a single soil test result.
 *
 * Backend endpoint:
 *
 * GET /api/soil/results/<resultId>/recommendation/
 */
export async function getSoilRecommendation(
  resultId: number
): Promise<SoilRecommendation> {
  try {
    const response =
      await api.get<SoilRecommendation>(
        `/soil/results/${resultId}/recommendation/`,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil recommendation loaded successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil recommendation:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


/* ==========================================================================
   SOIL ANALYSIS
   ========================================================================== */

export async function getSoilAnalyses(
  testId?: number,
  sampleId?: number
): Promise<SoilAnalysis[]> {
  try {
    const params =
      new URLSearchParams();

    if (testId !== undefined) {
      params.append(
        "test",
        String(testId)
      );
    }

    if (sampleId !== undefined) {
      params.append(
        "sample",
        String(sampleId)
      );
    }

    const query = params.toString();

    const response =
      await api.get<SoilAnalysis[]>(
        `/soil/analysis/${
          query ? `?${query}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil analyses loaded successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil analyses:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilAnalysis(
  id: number
): Promise<SoilAnalysis> {
  try {
    const response =
      await api.get<SoilAnalysis>(
        `/soil/analysis/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil analysis loaded successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to load soil analysis:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilAnalysisByTest(
  testId: number
): Promise<SoilAnalysis | null> {
  try {
    const analyses =
      await getSoilAnalyses(testId);

    if (analyses.length === 0) {
      return null;
    }

    return analyses[0];
  } catch (error) {
    console.error(
      "Unable to load soil analysis by test:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function getSoilAnalysisBySample(
  sampleId: number
): Promise<SoilAnalysis | null> {
  try {
    const analyses =
      await getSoilAnalyses(
        undefined,
        sampleId
      );

    if (analyses.length === 0) {
      return null;
    }

    return analyses[
      analyses.length - 1
    ];
  } catch (error) {
    console.error(
      "Unable to load soil analysis by sample:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function createSoilAnalysis(
  data: CreateSoilAnalysisPayload
): Promise<SoilAnalysis> {
  try {
    console.log(
      "Creating soil analysis with payload:",
      data
    );

    const response =
      await api.post<SoilAnalysis>(
        "/soil/analysis/",
        data,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil analysis created successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to create soil analysis:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function updateSoilAnalysis(
  id: number,
  data: Partial<CreateSoilAnalysisPayload>
): Promise<SoilAnalysis> {
  try {
    const response =
      await api.patch<SoilAnalysis>(
        `/soil/analysis/${id}/`,
        data,
        {
          headers: getAuthHeaders(),
        }
      );

    console.log(
      "Soil analysis updated successfully:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to update soil analysis:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}


export async function deleteSoilAnalysis(
  id: number
): Promise<void> {
  try {
    await api.delete(
      `/soil/analysis/${id}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log(
      "Soil analysis deleted successfully:",
      id
    );
  } catch (error) {
    console.error(
      "Unable to delete soil analysis:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}

/* ==========================================================================
   SOIL REPORT PDF
   ========================================================================== */

/**
 * Download a completed SoilGenie soil report as PDF.
 *
 * Backend endpoint:
 *
 * GET /api/reports/soil/<testId>/pdf/
 *
 * Returns the PDF as a Blob so the frontend can
 * trigger a browser download.
 */
export async function downloadSoilReportPdf(
  testId: number
): Promise<Blob> {
  try {
    const response = await api.get(
      `/reports/soil/${testId}/pdf/`,
      {
        responseType: "blob",
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Unable to download soil report PDF:",
      error
    );

    throw new Error(
      getErrorMessage(error)
    );
  }
}