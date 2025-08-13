import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native';
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
  const { todos } = useTodos();

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
      {/* Placeholder for on going task and reminder */}
      <ScrollView>
        <View>
          <Text style={styles.header_task}>
            Pending Tasks . . .
          </Text>
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
      </ScrollView>
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
});
