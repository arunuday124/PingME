import React from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome</Text>
      <Text style={styles.text_new}>Back</Text>
      <Text style={styles.text_line}>SignIn To Never Forget Anything !</Text>

      {/* //Input fields for email and password */}
      <ImageBackground
        source={require('../../assets/images/reminderoutline.png')} // Replace with your image path
        style={styles.imageBackground}
        resizeMode="cover"
      >
      <TextInput
        style={styles.email_input}
        placeholder="Email"
        placeholderTextColor="#dbf0dd"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.password_input}
        placeholder="Password"
        placeholderTextColor="#dbf0dd"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.button_container}>
        <TouchableOpacity>
          <Text style={styles.forgot_pass}>Forgot Password ?</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.new_acc}>Create new account</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity>
          <Text style={styles.Login}>Login</Text>
        </TouchableOpacity>
      </View>
      </ImageBackground>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // experimental_backgroundImage: 'linear-gradient(to top, #ffffffff, #c2f703ff)',
    backgroundColor: '#235347',
  },
  text: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#acbdae',
    fontFamily: 'times',
    marginTop: hp('10%'),
    marginLeft: wp('10%'),
  },
  text_new: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#e2eee3ff',
    fontFamily: 'times',
    marginLeft: wp('10%'),
  },
  text_line: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'times',
    marginLeft: wp('10%'),
    marginTop: hp('1%'),
    width: '80%',

  },
  email_input: {
    width: '85%',
    height: hp('7%'),
    borderBottomWidth: 2, // Added for bottom line
    borderBottomColor: '#dbf0dd', // Color of the bottom line
    paddingHorizontal: 10,
    marginBottom: hp('2%'),
    backgroundColor: '#235347',
    alignSelf: 'center',
    marginTop: hp('15%'),
    color: '#ffffff', // Set text color to white
  },
  password_input: {
    width: '85%',
    height: hp('7%'),
    borderBottomWidth: 2, // Added for bottom line
    borderBottomColor: '#dbf0dd', // Color of the bottom line
    paddingHorizontal: 10,
    marginBottom: hp('2%'),
    backgroundColor: '#235347',
    alignSelf: 'center',
    color: '#ffffff', // Set text color to white
  },
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: hp('2%'),
  },
  forgot_pass: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'times',
    width: '125%',
    height: hp('6.5%'),
    backgroundColor: '#8bb599',
    borderRadius: 8,
    textAlign: 'center',
    paddingVertical: 15,
    marginLeft: wp('1%'),
  },
  new_acc: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'times',
    fontWeight: 'bold',
    width: '96%',
    height: hp('6.5%'),
    backgroundColor: '#051f20',
    borderRadius: 8,
    textAlign: 'center',
    paddingVertical: 10,
  },
  Login: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'times',
    width: '89%',
    height: hp('6.5%'),
    backgroundColor: '#0b2a23',
    borderRadius: 8,
    textAlign: 'center',
    paddingVertical: 15,
    alignSelf: 'center',
    marginTop: hp('2%'),
  },
  imageBackground: {
    flex: 1,
    marginTop: hp('-5%'),
    width: '100%',
    height: '100%',
  },
});
