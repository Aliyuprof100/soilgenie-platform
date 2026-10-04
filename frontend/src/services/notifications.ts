import api from "../api/api";


export type NotificationType =
  | "SOIL_SAMPLE"
  | "SOIL_TEST"
  | "SOIL_REPORT"
  | "MEASUREMENT_WARNING"
  | "SYSTEM";


export type NotificationPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "CRITICAL";


export interface Notification {
  id: number;

  recipient: string;
  recipient_name: string;

  notification_type: NotificationType;
  priority: NotificationPriority;

  title: string;
  message: string;

  is_read: boolean;
  read_at?: string | null;

  action_url?: string | null;

  farmer?: number | null;
  farmer_name?: string | null;

  farm?: number | null;
  farm_name?: string | null;

  soil_sample?: number | null;
  sample_id?: string | null;

  soil_test?: number | null;
  test_id?: string | null;

  created_at: string;
  updated_at: string;
}


export interface UnreadNotificationCount {
  unread_count: number;
}


export interface MarkAllReadResponse {
  updated: number;
  message: string;
}


/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export async function getNotifications(
  options?: {
    isRead?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  }
): Promise<Notification[]> {
  const params = new URLSearchParams();

  if (options?.isRead !== undefined) {
    params.append(
      "is_read",
      String(options.isRead)
    );
  }

  if (options?.type) {
    params.append(
      "type",
      options.type
    );
  }

  if (options?.priority) {
    params.append(
      "priority",
      options.priority
    );
  }

  const query = params.toString();

  const response =
    await api.get<Notification[]>(
      `/notifications/${
        query ? `?${query}` : ""
      }`
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| GET UNREAD COUNT
|--------------------------------------------------------------------------
*/

export async function getUnreadNotificationCount():
Promise<number> {
  const response =
    await api.get<UnreadNotificationCount>(
      "/notifications/unread-count/"
    );

  return response.data.unread_count;
}


/*
|--------------------------------------------------------------------------
| MARK ONE AS READ
|--------------------------------------------------------------------------
*/

export async function markNotificationAsRead(
  id: number
): Promise<Notification> {
  const response =
    await api.patch<Notification>(
      `/notifications/${id}/mark-read/`,
      {}
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| MARK ONE AS UNREAD
|--------------------------------------------------------------------------
*/

export async function markNotificationAsUnread(
  id: number
): Promise<Notification> {
  const response =
    await api.patch<Notification>(
      `/notifications/${id}/mark-unread/`,
      {}
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| MARK ALL AS READ
|--------------------------------------------------------------------------
*/

export async function markAllNotificationsAsRead():
Promise<MarkAllReadResponse> {
  const response =
    await api.patch<MarkAllReadResponse>(
      "/notifications/mark-all-read/",
      {}
    );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| DELETE NOTIFICATION
|--------------------------------------------------------------------------
*/

export async function deleteNotification(
  id: number
): Promise<void> {
  await api.delete(
    `/notifications/${id}/`
  );
}