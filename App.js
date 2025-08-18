import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './src/components/LoadingScreen';
import Login from './src/components/Login';
import SignUp from './src/components/SignUp';
import Dashboard from './src/components/Dashboard';
import { TodosProvider } from './src/context/TodosContext';
import { actuatedNormalize } from './src/utils/responsive';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  return (
    <TodosProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoading ? (
            <Stack.Screen name="Loading" component={LoadingScreen} />
          ) : (
            <>
              {/* <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} /> */}
            </>
          )}
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </TodosProvider>
  );
};

export default App;
