import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, { TriggerType, AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useTodos } from '../context/TodosContext';
import moment from 'moment';

const Reminder = () => {
  const { reminders, addReminder, deleteReminder } = useTodos();
  const [reminderText, setReminderText] = useState('');
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 5 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reminderDescription, setReminderDescription] = useState(''); // New state for description

  const formattedDate = useMemo(() => {
    const d = scheduledAt;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [scheduledAt]);

  const ensurePermissionsAndChannel = useCallback(async () => {
    // iOS + Android 13 runtime permission
    await notifee.requestPermission();
    const settings = await notifee.getNotificationSettings();
    if (
      settings.authorizationStatus === AuthorizationStatus.DENIED ||
      settings.authorizationStatus === AuthorizationStatus.BLOCKED
    ) {
      Alert.alert(
        'Notifications disabled',
        'System notifications are disabled for this app. Enable them in system settings to receive reminders.'
      );
    }
    // Android channel (no-op on iOS)
    const channelId = await notifee.createChannel({
      id: 'reminders',
      name: 'Reminders',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
      lights: true,
    });
    return channelId;
  }, []);

  const onChangeDate = (_event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(scheduledAt);
      updated.setFullYear(selected.getFullYear());
      updated.setMonth(selected.getMonth());
      updated.setDate(selected.getDate());
      setScheduledAt(updated);
    }
  };

  const onChangeTime = (_event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(scheduledAt);
      updated.setHours(selected.getHours());
      updated.setMinutes(selected.getMinutes());
      updated.setSeconds(0);
      updated.setMilliseconds(0);
      setScheduledAt(updated);
    }
  };

  const scheduleReminder = useCallback(async () => {
    if (!reminderText.trim()) {
      Alert.alert('Missing info', 'Please enter what to remind.');
      return;
    }
    const now = Date.now();
    const timestamp = scheduledAt.getTime();
    if (timestamp <= now + 1500) {
      Alert.alert('Invalid time', 'Please pick a future time.');
      return;
    }

    try {
      setSubmitting(true);
      const channelId = await ensurePermissionsAndChannel();
      const notificationId = `reminder-${timestamp}-${Math.floor(Math.random() * 1e6)}`;

      // Use exact alarms when permitted; otherwise fall back to inexact on Android 12+ (API 31+)
      let useExact = true;
      if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
        try {
          const hasChecker = typeof (notifee).isAlarmPermissionGranted === 'function';
          if (hasChecker) {
            const granted = await (notifee).isAlarmPermissionGranted();
            useExact = Boolean(granted);
          } else {
            useExact = false;
          }
        } catch (_) {
          useExact = false;
        }
      }

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp,
        alarmManager: {
          allowWhileIdle: true,
          exact: useExact,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: 'Reminder',
          body: reminderText.trim(),
          ios: {
            foregroundPresentationOptions: {
              alert: true,
              sound: true,
              badge: true,
            },
          },
          android: {
            channelId,
            smallIcon: 'ic_stat_notification',
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );

      Alert.alert('Scheduled', `Reminder set for ${formattedDate}.`);
      // Reset text but keep chosen time
      setReminderText('');
      setReminderDescription(''); // Clear description on successful schedule

      // Save reminder to TodosContext
      addReminder(
        moment(scheduledAt), // date
        reminderText.trim(), // title
        reminderDescription.trim(), // description
        false, // isAllDay (false for now, as time is picked)
        moment(scheduledAt) // time
      );

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to schedule the reminder.');
    } finally {
      setSubmitting(false);
    }
  }, [ensurePermissionsAndChannel, formattedDate, reminderText, scheduledAt, addReminder, reminderDescription]);

  const cancelReminder = useCallback(async (id) => {
    try {
      await notifee.cancelTriggerNotification(id);
    } catch (e) {
      // ignore device state
    } finally {
      deleteReminder(id);
    }
  }, [deleteReminder]);

  const intervalRef = useRef();
  const [localReminders, setLocalReminders] = useState([]);

  useEffect(() => {
    // Sync local reminders with context reminders
    setLocalReminders(reminders.map(r => ({ ...r, notified: r.notified || false })));
  }, [reminders]);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      let updatedReminders = [...localReminders];
      let changed = false;
      for (let i = 0; i < updatedReminders.length; i++) {
        const reminder = updatedReminders[i];
        if (!reminder.notified && reminder.timestamp <= now) {
          const channelId = await ensurePermissionsAndChannel();
          await notifee.displayNotification({
            title: 'Reminder',
            body: reminder.title,
            android: {
              channelId,
              smallIcon: 'ic_stat_notification',
            },
          });
          updatedReminders[i] = { ...reminder, notified: true };
          changed = true;
        }
      }
      if (changed) {
        setLocalReminders(updatedReminders);
      }
    }, 10000);
    return () => clearInterval(intervalRef.current);
  }, [localReminders, ensurePermissionsAndChannel]);

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderText}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.reminderDescription}>{item.description}</Text>
              ) : null}
              {!item.isAllDay && (
                <Text style={styles.reminderWhen}>{moment(item.timestamp).format('YYYY-MM-DD HH:mm')}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelReminder(item.id)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={(
          <>
            <Text style={styles.title}>Set a Reminder</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              value={reminderText}
              onChangeText={setReminderText}
              placeholder="e.g., Call John about project"
              placeholderTextColor="#9A9BA1"
              style={styles.input}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              value={reminderDescription}
              onChangeText={setReminderDescription}
              placeholder="Add more details..."
              placeholderTextColor="#9A9BA1"
              style={[styles.input, styles.descriptionInput]}
              multiline
            />

            <Text style={styles.label}>When to remind</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.selectorButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.selectorButtonText}>Pick Date</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectorButton} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.selectorButtonText}>Pick Time</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.whenText}>{formattedDate}</Text>

            {showDatePicker && (
              <DateTimePicker
                value={scheduledAt}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={onChangeDate}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={scheduledAt}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeTime}
              />
            )}

            <TouchableOpacity
              style={[styles.scheduleButton, submitting && styles.scheduleButtonDisabled]}
              onPress={scheduleReminder}
              disabled={submitting}
            >
              <Text style={styles.scheduleButtonText}>{submitting ? 'Scheduling...' : 'Schedule Reminder'}</Text>
            </TouchableOpacity>

            <Text style={styles.listHeader}>Scheduled reminders</Text>
          </>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming reminders</Text>}
        contentContainerStyle={styles.scrollContainer}
      />
    </View>
  );
};

export default Reminder;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  container: {
    flex: 1,
    backgroundColor: '#373739ff',
    padding: 16,
  },
  title: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'times',
  },
  label: {
    marginTop: 18,
    color: '#dbf0dd',
    fontSize: 14,
    fontFamily: 'times',
  },
  input: {
    marginTop: 8,
    backgroundColor: '#2A2B2E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontFamily: 'times',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  selectorButton: {
    flex: 1,
    backgroundColor: '#dbf0dd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorButtonText: {
    color: '#0a2d26',
    fontWeight: 'bold',
    fontFamily: 'times',
  },
  whenText: {
    marginTop: 10,
    color: '#9A9BA1',
    fontFamily: 'times',
  },
  scheduleButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  scheduleButtonDisabled: {
    opacity: 0.6,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'times',
  },
  listHeader: {
    marginTop: 28,
    marginBottom: 8,
    color: '#dbf0dd',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'times',
  },
  emptyText: {
    color: '#9A9BA1',
    marginTop: 6,
    fontFamily: 'times',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2A2B2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  reminderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'times',
  },
  reminderDescription: {
    color: '#9A9BA1',
    fontSize: 13,
    fontFamily: 'times',
    marginTop: 4,
    marginBottom: 4,
  },
  reminderWhen: {
    color: '#9A9BA1',
    fontSize: 13,
    fontFamily: 'times',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#d9534f',
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'times',
  },
});