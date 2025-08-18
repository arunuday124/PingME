import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Switch,
  Platform, // Import Platform
  Animated, // Import Animated
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerIOS } from '@react-native-community/datetimepicker'; // Import DateTimePicker
import React, { useState, useEffect, useRef } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import moment from 'moment';
import { useTodos } from '../context/TodosContext';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const { todos, reminders, addReminder } = useTodos();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState(moment());
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [reminderTime, setReminderTime] = useState(moment());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current; // For tab indicator animation

  // Calculate the width of each tab based on the tabBar width (70% of screen width, divided by 2 tabs)
  const tabWidth = wp('70%') / 2;

  useEffect(() => {
    Animated.timing(tabIndicatorAnim, {
      toValue: activeTab === 'todos' ? 0 : 1,
      duration: 300, // Animation duration
      useNativeDriver: true, // Use native driver for performance
    }).start();
  }, [activeTab]); // Run animation when activeTab changes

  console.log('Reminders in Home:', reminders); // Add this line
  console.log('Selected date in Home:', selectedDate.format('YYYY-MM-DD')); // Add this line

  const flatListRef = useRef(null);
  const ITEM_WIDTH = 65 + 12; // dateItem width + marginRight

  useEffect(() => {
    generateDates(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    if (!dates.length) return;
    const today = moment();
    if (today.isSame(currentMonth, 'month')) {
      const index = dates.findIndex(d => d.isSame(today, 'day'));
      if (index >= 0) {
        setSelectedDate(today);
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        });
      }
    }
  }, [dates, currentMonth]);

  const filteredReminders = reminders.filter(reminder =>
    moment(reminder.date).isSame(selectedDate, 'day')
  );

  const generateDates = month => {
    const firstDay = moment(month).startOf('month');
    const daysInMonth = month.daysInMonth();
    const monthDates = [];

    for (let i = 0; i < daysInMonth; i++) {
      monthDates.push(moment(firstDay).add(i, 'days'));
    }
    setDates(monthDates);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month'));
  };

  const initialScrollIndex = moment().isSame(currentMonth, 'month')
    ? moment().date() - 1
    : 0;

  const showTimepicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: reminderTime.toDate(),
        onChange: onTimeSelected,
        mode: 'time',
        is24Hour: true,
      });
    } else {
      setShowTimePicker(true);
    }
  };

  const onTimeSelected = (event, selectedDate) => {
    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(moment(selectedDate));
    }
  };

  const handleSaveReminder = () => {
    // Logic to save reminder
    console.log('Saving reminder:', {
      date: reminderDate.format('YYYY-MM-DD'),
      title: reminderTitle,
      description: reminderDescription,
      isAllDay: isAllDay,
      time: isAllDay ? null : reminderTime.format('HH:mm'),
    });
    addReminder(
      reminderDate,
      reminderTitle,
      reminderDescription,
      isAllDay,
      reminderTime
    );
    setShowReminderModal(false);
    setReminderTitle('');
    setReminderDescription('');
    setIsAllDay(false);
    setReminderTime(moment());
  };

  const toggleAllDaySwitch = () => {
    setIsAllDay(!isAllDay);
    if (!isAllDay) {
      setReminderTime(moment());
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Month Navigation */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Text style={styles.navigationText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.format('MMMM YYYY')}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={styles.navigationText}>→</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.selectedDateText}>
          {selectedDate.format('DD MMMM')}
        </Text>
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={item => item.format('YYYY-MM-DD')}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          initialScrollIndex={initialScrollIndex}
          onScrollToIndexFailed={(info) => {
            // safe fallback
            const offset = Math.min(info.averageItemLength * info.index, info.averageItemLength * (dates.length - 1));
            flatListRef.current?.scrollToOffset({ offset, animated: true });
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 50);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDate(item)}
              onLongPress={() => {
                setReminderDate(item);
                setShowReminderModal(true);
              }}
              style={[
                styles.dateItem,
                selectedDate.format('DD') === item.format('DD') &&
                  selectedDate.format('MM') === item.format('MM') &&
                  styles.selectedDate,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate.format('DD') === item.format('DD') &&
                    selectedDate.format('MM') === item.format('MM') &&
                    styles.selectedText,
                ]}
              >
                {item.format('ddd')}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate.format('DD') === item.format('DD') &&
                    selectedDate.format('MM') === item.format('MM') &&
                    styles.selectedText,
                ]}
              >
                {item.format('DD')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth,
              transform: [
                {
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0.1, 1.16],
                    outputRange: [0, tabWidth], // Move from left (0) to right (tabWidth)
                  }),
                },
              ],
            },
          ]}
        />
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('todos')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'todos' && styles.activeTabText,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('reminders')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reminders' && styles.activeTabText,
            ]}
          >
            Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder for on going task and reminder */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'todos' && (
          <View style={{paddingBottom: 65}}>
            {todos.length === 0 ? (
              <Text style={styles.emptyText}>No Task Yet</Text>
            ) : (
              todos.map(todo => {
                const total = todo.tasks.length;
                const done = todo.tasks.filter(t => t.completed).length;
                return (
                  <View key={todo.id} style={styles.todoItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.todoTitle}>{todo.title}</Text>
                      <Text style={styles.todoMeta}>Created on: {todo.date}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${total === 0 ? 0 : Math.round((done/total)*100)}%` }]} />
                      </View>
                      <Text style={styles.todoMeta}>{done}/{total} tasks done</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'reminders' && (
          <View style={{paddingBottom: 65}}>
            {filteredReminders.length === 0 ? (
              <Text style={styles.emptyText}>No Reminders for this Date</Text>
            ) : (
              filteredReminders.map(reminder => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  {reminder.description ? (
                    <Text style={styles.reminderDescription}>{reminder.description}</Text>
                  ) : null}
                  {!reminder.isAllDay && (
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReminderModal}
        onRequestClose={() => {
          setShowReminderModal(!showReminderModal);
        }}>
        <Pressable
          style={styles.centeredView}
          onPress={() => setShowReminderModal(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Set Reminder for {reminderDate.format('DD MMMM YYYY')}</Text>
            {/* Reminder content will go here */}
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#9A9BA1"
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (Optional)"
              placeholderTextColor="#9A9BA1"
              multiline
              value={reminderDescription}
              onChangeText={setReminderDescription}
            />
            <View style={styles.rowContainer}>
              <Text style={styles.label}>All Day:</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={Platform.OS === 'ios' ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleAllDaySwitch}
                value={isAllDay}
              />
            </View>
            {!isAllDay && (
              <View style={styles.rowContainer}>
                <Text style={styles.label}>Time:</Text>
                <TouchableOpacity onPress={showTimepicker}>
                  <Text style={styles.timeText}>{reminderTime.format('HH:mm')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime.toDate()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeSelected}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleSaveReminder}>
                <Text style={styles.textStyle}>Save Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setShowReminderModal(false)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#373739ff',
    padding: 16,
  },
  header: {
    marginTop: hp('5%'),
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  navigationText: {
    color: '#FFFFFF',
    fontSize: 34,
    padding: 10,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'times',
  },
  selectedDateText: {
    fontSize: 18,
    color: '#9A9BA1',
    marginTop: 5,
    fontFamily: 'times',
  },
  calendarContainer: {
    marginTop: 20,
    margin: -10,
    paddingBottom: 10,
  },
  dateItem: {
    width: 65,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 30,
    backgroundColor: '#dbf0dd',
  },
  selectedDate: {
    backgroundColor: '#316055ff',
  },
  dayText: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 5,
    fontFamily: 'times',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f4e4eff',
    fontFamily: 'times',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  header_task:{
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'times',
  },
  emptyText: {
    color: '#9A9BA1',
    fontFamily: 'times',
    fontSize: 38,
    alignSelf: 'center',
    marginTop: 80,
    opacity: 0.3,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2A2B2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  todoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'times',
  },
  todoMeta: {
    color: '#9A9BA1',
    fontSize: 13,
    fontFamily: 'times',
    marginTop: 4,
  },
  progressBar: {
    marginTop: 6,
    height: 8,
    backgroundColor: '#383a3e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: '#373739ff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    minHeight: hp('40%'), // Adjust height as needed
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#fc3f5bff',
    marginTop: 10,
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#2A2B2E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timeText: {
    color: '#81b0ff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: '#fc3f5bff',
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reminderItem: {
    backgroundColor: '#2A2B2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#81b0ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  reminderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'times',
  },
  reminderDescription: {
    color: '#9A9BA1',
    fontSize: 13,
    fontFamily: 'times',
    marginTop: 4,
  },
  reminderTime: {
    color: '#9A9BA1',
    fontSize: 13,
    fontFamily: 'times',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2A2B2E',
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#383a3e',
    width: '70%',
    alignSelf: 'center',
    overflow: 'hidden',
    height: 50, // Explicit height to contain indicator
  },
  tabItem: {
    flex: 1, // Distribute space equally
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Maintain vertical padding for touchable area
  },
  activeTab: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
  tabText: {
    color: '#9A9BA1',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'times',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
});
