import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { useTodos } from '../context/TodosContext';

const Todo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done
  const [expandedIds, setExpandedIds] = useState([]); // array of todo ids
  const {
    todos,
    addTodo: addTodoCtx,
    deleteTodo: deleteTodoCtx,
    addTask: addTaskCtx,
    toggleTask: toggleTaskCtx,
  } = useTodos();

  // Animated values for each todo's progress (percent 0-100)
  const progressAnims = useRef({});

  // Animate progress values whenever todos change
  useEffect(() => {
    todos.forEach(t => {
      const total = t.tasks.length;
      const completed = t.tasks.filter(x => x.completed).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      if (!progressAnims.current[t.id]) {
        // initialize to current percent to avoid jump
        progressAnims.current[t.id] = new Animated.Value(percent);
      } else {
        Animated.timing(progressAnims.current[t.id], {
          toValue: percent,
          duration: 420,
          useNativeDriver: false, // width animation can't use native driver
        }).start();
      }
    });
  }, [todos]);

  const addTodo = () => {
    if (!todoTitle.trim()) return;
    addTodoCtx(todoTitle);
    setTodoTitle('');
    setModalVisible(false);
  };

  const addTask = todoId => {
    if (!newTask.trim()) return;
    addTaskCtx(todoId, newTask);
    setNewTask('');
  };

  const toggleTask = (todoId, taskId) => {
    toggleTaskCtx(todoId, taskId);
  };

  const deleteTodo = todoId => {
    deleteTodoCtx(todoId);
  };

  const renderRightActions = todoId => {
    return (
      <View style={styles.deleteActionContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTodo(todoId)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getTodoStats = todo => {
    const totalTasks = todo.tasks.length;
    const completedTasks = todo.tasks.filter(t => t.completed).length;
    const isDone = totalTasks > 0 && completedTasks === totalTasks;
    const isActive = !isDone; // empty lists considered active
    return { totalTasks, completedTasks, isDone, isActive };
  };

  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return todos
      .filter(t => (q ? t.title.toLowerCase().includes(q) : true))
      .filter(t => {
        const { isDone, isActive } = getTodoStats(t);
        if (filter === 'done') return isDone;
        if (filter === 'active') return isActive;
        return true;
      });
  }, [todos, searchQuery, filter]);

  const summary = useMemo(() => {
    const totalLists = todos.length;
    const totalTasks = todos.reduce((acc, t) => acc + t.tasks.length, 0);
    const completedTasks = todos.reduce(
      (acc, t) => acc + t.tasks.filter(x => x.completed).length,
      0,
    );
    return { totalLists, totalTasks, completedTasks };
  }, [todos]);

  const toggleExpand = todoId => {
    setExpandedIds(prev =>
      prev.includes(todoId)
        ? prev.filter(id => id !== todoId)
        : [...prev, todoId],
    );
  };

  return (
    <View style={styles.container}>
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.todo_addButton}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Add new list"
      >
        <Text style={styles.todo_addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Todo Lists</Text>
        <Text style={styles.headerSubtitle}>
          {summary.totalLists} lists · {summary.completedTasks}/
          {summary.totalTasks} tasks done
        </Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search lists..."
        placeholderTextColor="#9A9BA1"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filters */}
      <View style={styles.filtersRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'done', label: 'Done' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Todo List */}
      <FlatList
        data={filteredTodos}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Task Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create your first Todo
            </Text>
          </View>
        }
        renderItem={({ item: todoItem }) => {
          const { totalTasks, completedTasks, isDone } = getTodoStats(todoItem);
          const ratio = totalTasks === 0 ? 0 : completedTasks / totalTasks;
          const expanded = expandedIds.includes(todoItem.id);
          return (
            <Swipeable
              renderRightActions={() => renderRightActions(todoItem.id)}
              rightThreshold={40}
              overshootRight={false}
            >
              <View style={styles.todoCard}>
                <TouchableOpacity
                  onPress={() => toggleExpand(todoItem.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.todoHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.todoTitle} numberOfLines={1}>
                        {todoItem.title}
                      </Text>
                      <Text style={styles.todoDate}>
                        Created on: {todoItem.date}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        isDone ? styles.statusDone : styles.statusActive,
                      ]}
                    >
                      <Text style={styles.statusPillText}>
                        {isDone ? 'Done' : 'Active'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      {(() => {
                        // ensure animated value exists for this todo
                        if (!progressAnims.current[todoItem.id]) {
                          progressAnims.current[todoItem.id] =
                            new Animated.Value(Math.round(ratio * 100));
                        }
                        const anim = progressAnims.current[todoItem.id];
                        const widthInterpolate = anim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        });
                        return (
                          <Animated.View
                            style={[
                              styles.progressFill,
                              { width: widthInterpolate },
                            ]}
                          />
                        );
                      })()}
                    </View>
                    <Text style={styles.progressText}>
                      {completedTasks}/{totalTasks} tasks
                    </Text>
                  </View>
                </TouchableOpacity>

                {expanded && (
                  <>
                    <FlatList
                      data={todoItem.tasks}
                      keyExtractor={task => task.id.toString()}
                      scrollEnabled={false}
                      renderItem={({ item: task }) => (
                        <TouchableOpacity
                          style={styles.taskItem}
                          onPress={() => toggleTask(todoItem.id, task.id)}
                        >
                          <View style={styles.checkboxContainer}>
                            <View
                              style={[
                                styles.checkbox,
                                task.completed && styles.checkedBox,
                              ]}
                            />
                            <Text
                              style={[
                                styles.taskText,
                                task.completed && styles.completedTask,
                              ]}
                            >
                              {task.text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.noTasksText}>No tasks yet.</Text>
                      }
                    />

                    <TouchableOpacity
                      style={styles.addTaskButton}
                      onPress={() => {
                        setSelectedTodo(todoItem);
                        setTaskModalVisible(true);
                      }}
                    >
                      <Text style={styles.addTaskButtonText}>+ Add Task</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Swipeable>
          );
        }}
      />

      {/* Add Todo Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create new todo</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter list title"
              placeholderTextColor="#9A9BA1"
              value={todoTitle}
              onChangeText={setTodoTitle}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={addTodo}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setTodoTitle('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add task</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task description"
              placeholderTextColor="#9A9BA1"
              value={newTask}
              onChangeText={setNewTask}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => {
                  addTask(selectedTodo.id);
                  setTaskModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setTaskModalVisible(false);
                  setNewTask('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Todo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#373739ff',
    padding: 16,
  },
  header: {
    marginTop: hp('2%'),
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'times',
  },
  headerSubtitle: {
    color: '#9A9BA1',
    marginTop: 4,
    fontFamily: 'times',
  },
  searchInput: {
    marginTop: 12,
    backgroundColor: '#2A2B2E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontFamily: 'times',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2A2B2E',
    borderRadius: 24,
  },
  filterChipActive: {
    backgroundColor: '#dbf0dd',
  },
  filterChipText: {
    color: '#dbf0dd',
    fontFamily: 'times',
    fontWeight: '600',
    fontSize: 15,
  },
  filterChipTextActive: {
    color: '#0a2d26',
  },
  todoCard: {
    backgroundColor: '#2A2B2E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    marginTop: hp('2%'),
    overflow: 'hidden', // Add this to ensure border radius works
  },
  todoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'times',
  },
  todoDate: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: '#383a3e',
  },
  statusDone: {
    backgroundColor: '#316055ff',
  },
  statusPillText: {
    color: '#dbf0dd',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'times',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#383a3e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#9A9BA1',
    fontSize: 12,
    fontFamily: 'times',
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'times',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  addTaskButton: {
    marginTop: 10,
    padding: 8,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontFamily: 'times',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2A2B2E',
    borderRadius: 15,
    padding: 20,
    width: wp('80%'),
  },
  modalTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'times',
  },
  input: {
    backgroundColor: '#373739ff',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'times',
  },
  todo_addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  todo_addButtonText: {
    fontSize: 42,
    color: '#020202ff',
    fontWeight: 'bold',
    fontFamily: 'times',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    width: wp('20%'),
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: wp('4%'),
    padding: wp('2%'),
  },
  deleteActionContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: wp('2%'),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
  },
  taskItem: {
    paddingVertical: 8,
  },
  noTasksText: {
    color: '#9A9BA1',
    fontFamily: 'times',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: hp('10%'),
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'times',
  },
  emptySubtitle: {
    color: '#9A9BA1',
    marginTop: 6,
    fontFamily: 'times',
  },
});
