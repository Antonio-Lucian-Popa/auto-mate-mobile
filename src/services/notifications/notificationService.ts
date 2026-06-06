/**
 * notificationService.ts
 * Pregatit pentru push prin Expo + notificari locale pentru remindere.
 * Tokenul Expo e stocat local; trimite-l la backend cand exista endpoint Expo Push.
 */
import * as Notifications from "expo-notifications";
import { jsonStorage } from "@/services/storage/secureStorage";
import { apiRequest } from "@/services/api/client";
import type { Reminder } from "@/types";
import { daysUntil } from "@/lib/date";

const TOKEN_KEY = "automate.expoPushToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    return status === "granted";
  },

  async registerForPush(): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await jsonStorage.set(TOKEN_KEY, token);
      // Trimite tokenul la backend (best-effort, nu blocheaza flow-ul)
      apiRequest("/notifications/expo-token", {
        method: "POST",
        body: { token, platform: "android" },
      }).catch(() => {/* ignorat intentionat */});
      return token;
    } catch {
      return null;
    }
  },

  /** Programeaza o notificare locala cu N zile inainte de scadenta reminderului */
  async scheduleReminder(reminder: Reminder, daysBefore = 7): Promise<string | null> {
    const days = daysUntil(reminder.dueDate) - daysBefore;
    if (days < 0) return null;
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + days);
    trigger.setHours(9, 0, 0, 0);
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${reminder.title} expiră curând`,
        body: `Reminder pentru ${reminder.type}. Verifică în AutoMate.`,
        data: { reminderId: reminder.id },
      },
      trigger,
    });
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
