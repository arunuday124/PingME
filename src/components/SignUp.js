import React from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!'); // Show popup error
      return;
    }
    // // Proceed with signup logic (e.g., API call)
    // Alert.alert('Success', 'Account created successfully!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create New</Text>
      <Text style={styles.text_new}>Account</Text>
      <Text style={styles.text_line}>SignUp To Never Forget Anything !</Text>

      {/* //Input fields for email, password, and confirm password */}
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
        <TextInput
          style={styles.password_input} // Reusing the same style as password_input
          placeholder="Confirm Password"
          placeholderTextColor="#dbf0dd"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <View style={styles.button_container}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.forgot_pass}>Already have account SignIn</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.Login}>SignIn</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default SignUp;

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
