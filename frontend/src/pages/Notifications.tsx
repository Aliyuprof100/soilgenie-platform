import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  FileText,
  FlaskConical,
  Info,
  Loader2,
  RefreshCw,
  Sprout,
  TestTube2,
  Trash2,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  type Notification,
} from "../services/notifications";


type NotificationFilter =
  | "ALL"
  | "UNREAD"
  | "SOIL"
  | "WARNINGS";


export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [filter, setFilter] =
    useState<NotificationFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [workingId, setWorkingId] =
    useState<number | null>(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const loadNotifications = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data =
          await getNotifications();

        setNotifications(data);
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);


  /*
  |--------------------------------------------------------------------------
  | DERIVED DATA
  |--------------------------------------------------------------------------
  */

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read
      ).length,
    [notifications]
  );


  const criticalCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.priority ===
            "CRITICAL" &&
          !notification.is_read
      ).length,
    [notifications]
  );


  const filteredNotifications =
    useMemo(() => {
      switch (filter) {
        case "UNREAD":
          return notifications.filter(
            (notification) =>
              !notification.is_read
          );

        case "SOIL":
          return notifications.filter(
            (notification) =>
              [
                "SOIL_SAMPLE",
                "SOIL_TEST",
                "SOIL_REPORT",
              ].includes(
                notification.notification_type
              )
          );

        case "WARNINGS":
          return notifications.filter(
            (notification) =>
              notification.notification_type ===
                "MEASUREMENT_WARNING" ||
              notification.priority ===
                "HIGH" ||
              notification.priority ===
                "CRITICAL"
          );

        case "ALL":
        default:
          return notifications;
      }
    }, [notifications, filter]);


  /*
  |--------------------------------------------------------------------------
  | MARK ONE READ / UNREAD
  |--------------------------------------------------------------------------
  */

  async function toggleRead(
    notification: Notification
  ) {
    try {
      setWorkingId(notification.id);

      const updated =
        notification.is_read
          ? await markNotificationAsUnread(
              notification.id
            )
          : await markNotificationAsRead(
              notification.id
            );

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    } catch (err) {
      console.error(
        "Unable to update notification:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification."
      );
    } finally {
      setWorkingId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | MARK ALL READ
  |--------------------------------------------------------------------------
  */

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);
      setError(null);

      await markAllNotificationsAsRead();

      const now =
        new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at:
            notification.read_at || now,
        }))
      );
    } catch (err) {
      console.error(
        "Unable to mark all notifications as read:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    notification: Notification
  ) {
    try {
      setWorkingId(notification.id);
      setError(null);

      await deleteNotification(
        notification.id
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.id !== notification.id
        )
      );
    } catch (err) {
      console.error(
        "Unable to delete notification:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete notification."
      );
    } finally {
      setWorkingId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | OPEN NOTIFICATION
  |--------------------------------------------------------------------------
  */

  async function openNotification(
    notification: Notification
  ) {
    try {
      let updated = notification;

      if (!notification.is_read) {
        updated =
          await markNotificationAsRead(
            notification.id
          );

        setNotifications((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item
          )
        );
      }

      if (updated.action_url) {
        navigate(updated.action_url);
      }
    } catch (err) {
      console.error(
        "Unable to open notification:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to open notification."
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <Loader2 className="mx-auto h-9 w-9 animate-spin text-green-700" />

            <p className="mt-4 font-medium text-slate-700">
              Loading notifications...
            </p>

          </div>

        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-7 text-white shadow-sm md:p-9">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-green-100">
                <Bell className="h-4 w-4" />
                SoilGenie Notifications
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Notification Centre
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 md:text-base">
                Stay informed about soil tests,
                reports, measurement warnings and
                actions requiring your attention.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  loadNotifications(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>


              <button
                type="button"
                onClick={
                  handleMarkAllRead
                }
                disabled={
                  markingAll ||
                  unreadCount === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}

                Mark all read
              </button>

            </div>

          </div>

        </section>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex gap-3">

              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="font-semibold text-red-900">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

            </div>

          </section>
        )}


        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">

          <SummaryCard
            label="All Notifications"
            value={notifications.length}
            icon={
              <Bell className="h-5 w-5" />
            }
          />

          <SummaryCard
            label="Unread"
            value={unreadCount}
            icon={
              <Info className="h-5 w-5" />
            }
          />

          <SummaryCard
            label="Critical Unread"
            value={criticalCount}
            icon={
              <AlertTriangle className="h-5 w-5" />
            }
            warning={
              criticalCount > 0
            }
          />

        </section>


        {/* ======================================================
            FILTERS
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

          <div className="flex flex-wrap gap-2">

            <FilterButton
              label="All"
              active={filter === "ALL"}
              onClick={() =>
                setFilter("ALL")
              }
            />

            <FilterButton
              label={`Unread (${unreadCount})`}
              active={
                filter === "UNREAD"
              }
              onClick={() =>
                setFilter("UNREAD")
              }
            />

            <FilterButton
              label="Soil Activity"
              active={
                filter === "SOIL"
              }
              onClick={() =>
                setFilter("SOIL")
              }
            />

            <FilterButton
              label="Warnings"
              active={
                filter === "WARNINGS"
              }
              onClick={() =>
                setFilter("WARNINGS")
              }
            />

          </div>

        </section>


        {/* ======================================================
            NOTIFICATION LIST
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              {getFilterTitle(filter)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredNotifications.length}{" "}
              {filteredNotifications.length === 1
                ? "notification"
                : "notifications"}
            </p>

          </div>


          {filteredNotifications.length ===
          0 ? (
            <EmptyNotifications
              filter={filter}
            />
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredNotifications.map(
                (notification) => (
                  <NotificationRow
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    working={
                      workingId ===
                      notification.id
                    }
                    onOpen={() =>
                      openNotification(
                        notification
                      )
                    }
                    onToggleRead={() =>
                      toggleRead(
                        notification
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        notification
                      )
                    }
                  />
                )
              )}

            </div>
          )}

        </section>


        {/* ======================================================
            INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-green-100 bg-green-50 p-5">

          <div className="flex gap-3">

            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

            <div>

              <h2 className="font-semibold text-green-900">
                About SoilGenie notifications
              </h2>

              <p className="mt-1 text-sm leading-6 text-green-800">
                Notifications help you keep track of
                important SoilGenie activity. Soil
                measurement warnings and verification
                notices should be reviewed before
                farmer guidance is shared.
              </p>

            </div>

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}


/* ============================================================
   NOTIFICATION ROW
============================================================ */

function NotificationRow({
  notification,
  working,
  onOpen,
  onToggleRead,
  onDelete,
}: {
  notification: Notification;
  working: boolean;
  onOpen: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`relative px-5 py-5 transition md:px-6 ${
        notification.is_read
          ? "bg-white"
          : "bg-green-50/40"
      }`}
    >

      {!notification.is_read && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-green-600" />
      )}


      <div className="flex gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClasses(
            notification
          )}`}
        >
          {getNotificationIcon(
            notification.notification_type
          )}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

            <button
              type="button"
              onClick={onOpen}
              className="min-w-0 text-left"
            >

              <div className="flex flex-wrap items-center gap-2">

                <h3
                  className={`font-semibold ${
                    notification.is_read
                      ? "text-slate-800"
                      : "text-slate-950"
                  }`}
                >
                  {notification.title}
                </h3>

                {!notification.is_read && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    New
                  </span>
                )}

                <PriorityBadge
                  priority={
                    notification.priority
                  }
                />

              </div>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {notification.message}
              </p>


              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

                <span>
                  {formatDateTime(
                    notification.created_at
                  )}
                </span>

                {notification.farm_name && (
                  <span>
                    Farm:{" "}
                    {
                      notification.farm_name
                    }
                  </span>
                )}

                {notification.sample_id && (
                  <span>
                    Sample:{" "}
                    {
                      notification.sample_id
                    }
                  </span>
                )}

              </div>


              {notification.action_url && (
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                  Open details
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}

            </button>


            <div className="flex shrink-0 items-center gap-2">

              <button
                type="button"
                disabled={working}
                onClick={
                  onToggleRead
                }
                title={
                  notification.is_read
                    ? "Mark as unread"
                    : "Mark as read"
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                {working ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : notification.is_read ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>


              <button
                type="button"
                disabled={working}
                onClick={onDelete}
                title="Delete notification"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              warning
                ? "text-red-700"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            warning
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-green-700 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}


/* ============================================================
   PRIORITY
============================================================ */

function PriorityBadge({
  priority,
}: {
  priority: Notification["priority"];
}) {
  const classes = {
    LOW:
      "bg-slate-100 text-slate-600",
    NORMAL:
      "bg-blue-50 text-blue-700",
    HIGH:
      "bg-amber-50 text-amber-700",
    CRITICAL:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        classes[priority] ||
        classes.NORMAL
      }`}
    >
      {formatLabel(priority)}
    </span>
  );
}


/* ============================================================
   ICONS
============================================================ */

function getNotificationIcon(
  type: Notification["notification_type"]
) {
  switch (type) {
    case "SOIL_SAMPLE":
      return (
        <FlaskConical className="h-5 w-5" />
      );

    case "SOIL_TEST":
      return (
        <TestTube2 className="h-5 w-5" />
      );

    case "SOIL_REPORT":
      return (
        <FileText className="h-5 w-5" />
      );

    case "MEASUREMENT_WARNING":
      return (
        <AlertTriangle className="h-5 w-5" />
      );

    case "SYSTEM":
    default:
      return (
        <Bell className="h-5 w-5" />
      );
  }
}


function getNotificationIconClasses(
  notification: Notification
) {
  if (
    notification.priority ===
    "CRITICAL"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    notification.priority === "HIGH"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    notification.notification_type ===
    "SOIL_REPORT"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    notification.notification_type ===
    "SOIL_TEST"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    notification.notification_type ===
    "SOIL_SAMPLE"
  ) {
    return "bg-purple-50 text-purple-700";
  }

  return "bg-slate-100 text-slate-600";
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyNotifications({
  filter,
}: {
  filter: NotificationFilter;
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Bell className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {filter === "UNREAD"
          ? "You're all caught up"
          : "No notifications found"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filter === "UNREAD"
          ? "You currently have no unread notifications."
          : "Notifications matching this view will appear here when SoilGenie has new activity for you."}
      </p>

    </div>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatLabel(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


function getFilterTitle(
  filter: NotificationFilter
) {
  switch (filter) {
    case "UNREAD":
      return "Unread Notifications";

    case "SOIL":
      return "Soil Activity";

    case "WARNINGS":
      return "Warnings & Alerts";

    case "ALL":
    default:
      return "All Notifications";
  }
}