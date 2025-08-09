import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Todo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');

  const addTodo = () => {
    if (todoTitle.trim()) {
      const today = new Date().toLocaleDateString(); // Get today's date
      setTodos([
        ...todos,
        {
          id: Date.now(),
          title: todoTitle,
          date: today, // Add date to the Todo
          tasks: [],
        },
      ]);
      setTodoTitle('');
      setModalVisible(false);
    }
  };

  const addTask = todoId => {
    if (newTask.trim()) {
      const updatedTodos = todos.map(todo => {
        if (todo.id === todoId) {
          return {
            ...todo,
            tasks: [
              ...todo.tasks,
              { id: Date.now(), text: newTask, completed: false },
            ],
          };
        }
        return todo;
      });
      setTodos(updatedTodos);
      setNewTask('');
    }
  };

  const toggleTask = (todoId, taskId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedTasks = todo.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        return { ...todo, tasks: updatedTasks };
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const deleteTodo = todoId => {
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  const renderRightActions = todoId => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(todoId)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Add Todo Button */}
      <TouchableOpacity
        style={styles.todo_addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.todo_addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Todo List */}
      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            rightThreshold={40}
          >
            <View style={styles.todoCard}>
              <Text style={styles.todoTitle}>{item.title}</Text>
              <Text style={styles.todoDate}>Created on: {item.date}</Text>{' '}
              {/* Display date */}
              {/* Tasks List */}
              <FlatList
                data={item.tasks}
                keyExtractor={task => task.id.toString()}
                renderItem={({ item: task }) => (
                  <TouchableOpacity
                    style={styles.taskItem}
                    onPress={() => toggleTask(selectedTodo.id, task.id)}
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
              />
              {/* Add Task Button */}
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => {
                  setSelectedTodo(item);
                  setTaskModalVisible(true);
                }}
              >
                <Text style={styles.addTaskButtonText}>+ Add Task</Text>
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
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
            <TextInput
              style={styles.input}
              placeholder="Enter Todo Title"
              value={todoTitle}
              onChangeText={setTodoTitle}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
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
            <TextInput
              style={styles.input}
              placeholder="Enter Task"
              value={newTask}
              onChangeText={setNewTask}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
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
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 90,
    right: 15,
    zIndex: 1,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  todoCard: {
    backgroundColor: '#2A2B2E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    marginTop: hp('2%'),
    overflow: 'hidden', // Add this to ensure border radius works
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
  addButton: {
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
    height: '77%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: wp('2%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: wp('4%'),
    padding: wp('2%'),
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
});
