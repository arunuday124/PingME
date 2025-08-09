import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import moment from 'moment';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());

  useEffect(() => {
    generateDates(currentMonth);
  }, [currentMonth]);

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
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={item => item.format('YYYY-MM-DD')}
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
  }
});
