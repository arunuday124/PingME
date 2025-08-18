import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity,Image } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Home from './Home';
import List from './Todo';
import Graph from './Reminder';

// import Account from './Account';


const Tab = createBottomTabNavigator();
function Dashboard() {
  return (
    <Tab.Navigator 
      screenOptions={{ headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle:{

        position: 'absolute',
        //bottom: 25,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: '#dbf0dd',
        borderRadius: 25,
        height: 72,
        marginLeft: wp('14%'),
        marginRight: wp('14%'),
        marginBottom: hp('2%'),
        
        ...styles.shadow
      }
      }}
    > 

      {/* home page */}
      <Tab.Screen name="Home" component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <View style = {{ alignItems : 'center', justifyContent : 'center', }}>
              <Image 
                  source={require('../../assets/images/home.png')}
                  resizeMode='contain'
                  style={{
                    width: 35,
                    height: 35,
                    tintColor: focused ? '#0a2d26' : '#59936dff',
                    marginTop: 29,
                    
                  }}
                />
              
            </View>

          ),

        }}
      />

      
      {/* List */}
      <Tab.Screen name="List" component={List}
              options={{
                tabBarIcon: ({focused}) => (
                  <View style = {{ alignItems : 'center', justifyContent : 'center', }}>
                    <Image 
                        source={require('../../assets/images/list.png')}
                        resizeMode='contain'
                        style={{
                          width: 40,
                          height: 40,
                          tintColor: focused ? '#0a2d26' : '#59936dff',
                          marginTop: 29
                        }}
                      />
                    
                  </View>
      
                ),
      
              }}
      
      />
        {/* upload page
        <Tab.Screen name="Upload" component={Upload}
              options={{
                tabBarIcon: ({focused}) => (
                  <View style = {{ alignItems : 'center', justifyContent : 'center', }}>
                    <Image 
                        source={require('../../assets/images/plus.png')}
                        resizeMode='contain'
                        style={{
                          width: 35,
                          height: 35,
                          tintColor: focused ? '#0a2d26' : '#59936dff',
                          marginTop: 20
                        }}
                      />
                    
                  </View>
      
                ),
      
              }}
      
        /> */}
        
        {/* Text page */}
      <Tab.Screen name="Graph" component={Graph}
      
      options={{
        tabBarIcon: ({focused}) => (
          <View style = {{ alignItems : 'center', justifyContent : 'center', }}>
            <Image 
                source={require('../../assets/images/reminder.png')}
                resizeMode='contain'
                style={{
                  width: 40,
                  height: 40,
                  tintColor: focused ? '#0a2d26' : '#59936dff',
                  marginTop: 29
                }}
              />
            
          </View>

        ),

      }}
      
      />

      {/* Account page */}
      {/* <Tab.Screen name="Account" component={Account} 
                options={{
                  tabBarIcon: ({focused}) => (
                    <View style = {{ alignItems : 'center', justifyContent : 'center', }}>
                      <Image 
                          source={require('../../assets/images/user.png')}
                          resizeMode='contain'
                          style={{
                            width: 35,
                            height: 35,
                            tintColor: focused ? '#0a2d26' : '#59936dff',
                            marginTop: 20
                          }}
                        />
                      
                    </View>
        
                  ),
        
                }}
      
      /> */}
      
    </Tab.Navigator>
  )
} 


// Styling functions
const styles = StyleSheet.create({
  shadow:{
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
})

export default Dashboard
