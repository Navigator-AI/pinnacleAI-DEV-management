import { storage } from "./storage";

const DAILY_REPORT_TIMEZONE = process.env.DAILY_REPORT_TIMEZONE || "Asia/Kolkata";
const DAILY_REPORT_SEND_TIME = process.env.DAILY_REPORT_SEND_TIME || "22:00";
const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL || "";
const REPORT_CHECK_INTERVAL_MS = 60 * 1000;

let schedulerHandle: NodeJS.Timeout | null = null;
let isSending = false;

function parseTimeToMinutes(time: string): number {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return (hour * 60) + minute;
}

function safeParseTimeToMinutes(time: string, fallback: number): number {
  try {
    return parseTimeToMinutes(time);
  } catch {
    return fallback;
  }
}

function getMinutesInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return (hour * 60) + minute;
}

function getDateKeyInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getTimeLabelInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getWeekdayFromDateKey(dateKey: string): string {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "Unknown";
  }

  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return weekdayNames[dayIndex] || "Unknown";
}

function isReportWindowReached(date: Date): boolean {
  const sendMinutes = safeParseTimeToMinutes(DAILY_REPORT_SEND_TIME, 22 * 60);
  return getMinutesInTimezone(date, DAILY_REPORT_TIMEZONE) >= sendMinutes;
}

function isWeekend(dateKey: string): boolean {
  const weekday = getWeekdayFromDateKey(dateKey);
  return weekday === "Saturday" || weekday === "Sunday";
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendToTeams(payload: Record<string, unknown>): Promise<void> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(TEAMS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Teams webhook failed with ${response.status}: ${responseText}`);
      }

      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await sleep(attempt * 1500);
    }
  }
}

function buildTeamsPayload(
  reportDate: string,
  submittedUpdateBlocks: string[],
  missingMembers: string[],
  totalUpdates: number,
  totalMembers: number,
): Record<string, unknown> {
  const weekday = getWeekdayFromDateKey(reportDate);
  const submittedMembersCount = submittedUpdateBlocks.length;
  const missingMembersCount = missingMembers.length;

  const submittedSection = submittedUpdateBlocks.length > 0
    ? submittedUpdateBlocks.join("\n\n")
    : "No members submitted task updates today.";

  const missingSection = missingMembers.length > 0
    ? missingMembers.map((name) => `- ${name}`).join("\n")
    : "All members submitted updates today.";

  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: `Daily Task Updates: ${reportDate} (${weekday})`,
    themeColor: "0076D7",
    title: `Daily Task Updates: ${reportDate} (${weekday})`,
    sections: [
      {
        markdown: true,
        facts: [
          { name: "Total Members", value: String(totalMembers) },
          { name: "Members Submitted", value: String(submittedMembersCount) },
          { name: "Members Missing", value: String(missingMembersCount) },
          { name: "Total Update Entries", value: String(totalUpdates) },
        ],
      },
      {
        title: "Submitted Updates",
        text: submittedSection,
        markdown: true,
      },
      {
        title: "Missing Updates",
        text: missingSection,
        markdown: true,
      },
    ],
  };
}

type SendReportOptions = {
  reportDate?: string;
  ignoreSchedule?: boolean;
  ignoreAlreadySent?: boolean;
  markAsSent?: boolean;
};

async function sendDailyTeamsReport(options?: SendReportOptions): Promise<{
  sent: boolean;
  reason?: string;
  reportDate: string;
  totalUpdates: number;
}> {
  if (!TEAMS_WEBHOOK_URL) {
    return {
      sent: false,
      reason: "TEAMS_WEBHOOK_URL is not configured",
      reportDate: getDateKeyInTimezone(new Date(), DAILY_REPORT_TIMEZONE),
      totalUpdates: 0,
    };
  }

  if (isSending) {
    return {
      sent: false,
      reason: "Report send already in progress",
      reportDate: getDateKeyInTimezone(new Date(), DAILY_REPORT_TIMEZONE),
      totalUpdates: 0,
    };
  }

  const now = new Date();
  const reportDate = options?.reportDate || getDateKeyInTimezone(now, DAILY_REPORT_TIMEZONE);
  if (!options?.ignoreSchedule && isWeekend(reportDate)) {
    return {
      sent: false,
      reason: `Weekend skipped for ${reportDate}`,
      reportDate,
      totalUpdates: 0,
    };
  }

  if (!options?.ignoreSchedule && !isReportWindowReached(now)) {
    return {
      sent: false,
      reason: "Report time window not reached yet",
      reportDate,
      totalUpdates: 0,
    };
  }

  const alreadySent = await storage.hasDailyReportBeenSent(reportDate);
  if (!options?.ignoreAlreadySent && alreadySent) {
    return {
      sent: false,
      reason: `Report already sent for ${reportDate}`,
      reportDate,
      totalUpdates: 0,
    };
  }

  isSending = true;
  try {
    const allUpdates = await storage.getAllTaskUpdates();
    const teamMembers = await storage.getTeamMembers();
    const adminMembers = teamMembers.filter((member) => member.role === "admin");
    const teamsNotificationsEnabled = adminMembers.length === 0
      ? true
      : adminMembers.some((member) => member.teamsNotificationEnabled ?? true);

    if (!teamsNotificationsEnabled) {
      return {
        sent: false,
        reason: "Teams notifications disabled",
        reportDate,
        totalUpdates: 0,
      };
    }

    const members = teamMembers.filter((member) => member.role === "member");

    const todaysUpdates = allUpdates.filter((update: any) => {
      if (!update?.createdAt) return false;
      const updateDate = new Date(update.createdAt);
      return getDateKeyInTimezone(updateDate, DAILY_REPORT_TIMEZONE) === reportDate;
    });

    const updatesByUser = new Map<string, any[]>();
    for (const update of todaysUpdates) {
      const userId = String(update.userId);
      const list = updatesByUser.get(userId) || [];
      list.push(update);
      updatesByUser.set(userId, list);
    }

    const submittedUpdateBlocks = members
      .filter((member) => (updatesByUser.get(member.id) || []).length > 0)
      .map((member) => {
      const memberUpdates = updatesByUser.get(member.id) || [];
      const latestUpdate = [...memberUpdates].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })[0];

      const headerProgress = latestUpdate?.progress === null || latestUpdate?.progress === undefined
        ? "Progress: N/A"
        : `Progress: ${latestUpdate.progress}%`;
      const headerTime = latestUpdate?.createdAt
        ? ` @ ${getTimeLabelInTimezone(new Date(latestUpdate.createdAt), DAILY_REPORT_TIMEZONE)}`
        : "";
      const memberHeaderMeta = `[ (${headerProgress})${headerTime} ]`;

      const updateLine = memberUpdates.map((update) => {
        const taskTitle = update.taskTitle || "Task";
        const content = String(update.content || "").replace(/\s+/g, " ").trim();
        return `- **${taskTitle}**: ${content}`;
      }).join("\n");

      return `**${member.name}** ${memberHeaderMeta}\n${updateLine}`;
    });

    const membersWithNoUpdate = members
      .filter((member) => (updatesByUser.get(member.id) || []).length === 0)
      .map((member) => member.name);

    const payload = buildTeamsPayload(
      reportDate,
      submittedUpdateBlocks,
      membersWithNoUpdate,
      todaysUpdates.length,
      members.length,
    );

    await sendToTeams(payload);
    if (options?.markAsSent !== false) {
      await storage.markDailyReportSent(reportDate);
    }
    console.log(`[daily-report] Sent Teams report for ${reportDate}`);
    return {
      sent: true,
      reportDate,
      totalUpdates: todaysUpdates.length,
    };
  } catch (error) {
    console.error("[daily-report] Failed to send Teams report:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown error",
      reportDate,
      totalUpdates: 0,
    };
  } finally {
    isSending = false;
  }
}

async function sendDailyTeamsReportIfDue(): Promise<void> {
  await sendDailyTeamsReport({
    ignoreSchedule: false,
    ignoreAlreadySent: false,
    markAsSent: true,
  });
}

export function startDailyTeamsReportScheduler(): void {
  if (schedulerHandle) {
    return;
  }

  if (!TEAMS_WEBHOOK_URL) {
    console.warn("[daily-report] TEAMS_WEBHOOK_URL is not configured; Teams report scheduler is disabled.");
    return;
  }

  console.log(
    `[daily-report] Scheduler enabled: report at ${DAILY_REPORT_SEND_TIME} (${DAILY_REPORT_TIMEZONE})`,
  );

  void sendDailyTeamsReportIfDue();
  schedulerHandle = setInterval(() => {
    void sendDailyTeamsReportIfDue();
  }, REPORT_CHECK_INTERVAL_MS);
}

// Note: The sendDailyTeamsReport function checks if Teams notifications are enabled
// before sending. This is controlled via the /api/settings/teams-notification endpoint.
// Users can toggle Teams notifications ON/OFF from the Reports page.
