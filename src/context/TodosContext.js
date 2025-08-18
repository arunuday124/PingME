import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { TriggerType, AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Alert, Platform } from 'react-native';

const TodosContext = createContext(null);
const TODOS_STORAGE_KEY = '@todos_key';
const REMINDERS_STORAGE_KEY = '@reminders_key';

export const TodosProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Load todos from AsyncStorage on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
        if (storedTodos !== null) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error("Failed to load todos from storage", error);
      }
    };
    loadTodos();
  }, []);

  // Load reminders from AsyncStorage on component mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const storedReminders = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        if (storedReminders !== null) {
          setReminders(JSON.parse(storedReminders));
        }
      } catch (error) {
        console.error("Failed to load reminders from storage", error);
      }
    };
    loadReminders();
  }, []);

  // Save todos to AsyncStorage whenever the todos state changes
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error("Failed to save todos to storage", error);
      }
    };
    saveTodos();
  }, [todos]);

  // Save reminders to AsyncStorage whenever the reminders state changes
  useEffect(() => {
    const saveReminders = async () => {
      try {
        await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
      } catch (error) {
        console.error("Failed to save reminders to storage", error);
      }
    };
    saveReminders();
  }, [reminders]);

  const addTodo = (title) => {
    const trimmed = String(title || '').trim();
    if (!trimmed) return;
    const today = new Date().toLocaleDateString();
    setTodos(prev => ([
      ...prev,
      {
        id: Date.now(),
        title: trimmed,
        date: today,
        tasks: [],
      },
    ]));
  };

  const deleteTodo = (todoId) => {
    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  const addTask = (todoId, text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          tasks: [...t.tasks, { id: Date.now(), text: trimmed, completed: false }],
        };
      }
      return t;
    }));
  };

  const toggleTask = (todoId, taskId) => {
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          tasks: t.tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task),
        };
      }
      return t;
    }));
  };

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

  const scheduleNotification = useCallback(async (id, title, body, timestamp) => {
    try {
      const channelId = await ensurePermissionsAndChannel();

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
          id: String(id),
          title,
          body,
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
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  }, [ensurePermissionsAndChannel]);

  const cancelNotification = useCallback(async (id) => {
    try {
      await notifee.cancelTriggerNotification(String(id));
    } catch (error) {
      console.error("Failed to cancel notification", error);
    }
  }, []);

  const addReminder = (date, title, description, isAllDay, time) => {
    const reminderTimestamp = isAllDay
      ? date.startOf('day').valueOf()
      : date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0).valueOf();

    const newReminder = {
      id: Date.now(), // Unique ID for the reminder
      date: date.format('YYYY-MM-DD'),
      title: title,
      description: description,
      isAllDay: isAllDay,
      time: isAllDay ? null : time.format('HH:mm'),
      timestamp: reminderTimestamp, // Timestamp for scheduling
    };
    setReminders(prev => {
      const updatedReminders = [...prev, newReminder].sort((a, b) => a.timestamp - b.timestamp);
      console.log('Added new reminder to context:', newReminder); // Add this line
      return updatedReminders;
    });

    // Schedule notification if the reminder is in the future
    if (reminderTimestamp > Date.now()) {
      scheduleNotification(newReminder.id, newReminder.title, newReminder.description || newReminder.title, newReminder.timestamp);
    }
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    cancelNotification(id);
  };

  const value = useMemo(() => ({
    todos,
    addTodo,
    deleteTodo,
    addTask,
    toggleTask,
    reminders,
    addReminder,
    deleteReminder,
  }), [todos, reminders, addReminder, deleteReminder]);

  return (
    <TodosContext.Provider value={value}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within a TodosProvider');
  return ctx;
};


