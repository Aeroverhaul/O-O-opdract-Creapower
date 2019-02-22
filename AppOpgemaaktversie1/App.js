import React from "react";
import {
  Button,
  TextInput,
  View,
  StyleSheet,
  AsyncStorage,
  Text
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Profile from "./Screen/ProfileScreen";
import HomeScreen from "./Screen/HomeScreen";
import { Constants, WebBrowser } from "expo";
import { CheckBox } from 'react-native-elements';
import * as firebase from "firebase";
import firebaseConfig from "./Firebase_config";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      Email: "",
      Woonplaats: "",
      Password: "",
      loggedIn: false,
      ToSagreed: false,
    };
  }

  //Dit is voor de Algemene Voorwaarden
  _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(
      "https://raw.githubusercontent.com/Jal3xR/ToS/master/readme.md"
    );
    this.setState({ result });
  };

  // runs when a render is called from this class (only the first time after launching the app)
  componentDidMount() {
    firebase.initializeApp(firebaseConfig.config);
    this.getInformation();
    this.LoginMethod(true);
  }

  async getInformation() {
    this._retrieveUser()
    .then(res=>{
      if (
        !(res == null || res == {} || res == undefined)
      ) {
        this.setState(res);
      }
    });
  }

  async _retrieveUser() {
    var raw = await AsyncStorage.getItem("identity");
    var json = JSON.parse(raw);
    return json;
  }

  async _storeUser() {
    await AsyncStorage.setItem("identity", JSON.stringify(this.state));
  }

    LoginMethod(autoTry) {
    /* All ur code authenticate and stuff*/
    var mailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (!this.state.loggedIn || this.state.loggedIn == undefined) {
      if (
        mailRegExp.test(this.state.Email) &&
        this.state.username.length >= 2 &&
        this.state.ToSagreed == true
      ) {
        firebase.auth().signInWithEmailAndPassword(this.state.Email, this.state.Password)
        .then(res => {
          this.setState({
            loggedIn: true
          });
          this._storeUser();
        })
        .catch(function(error) {
          if(!autoTry){
            alert("Verkeerde naam probeer opniew");
          }
        });
      } else {
        if(!autoTry){
          alert("Verkeerde gegevens, probeer opnieuw");
        }
      }
    }
  }

  signUpMethod(){
    var mailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (
      mailRegExp.test(this.state.Email) &&
      this.state.username.length >= 2 &&
      this.state.ToSagreed == true
    ) {
      firebase.auth().createUserWithEmailAndPassword(this.state.Email, this.state.Password)
      .then(res =>{
        this.setState({
          loggedIn: true
        });
        this._storeUser();
        firebase.auth().signInWithEmailAndPassword(this.state.Email, this.state.Password);
      })
      .catch(error=>{
        alert(error);
      });
    } else {
      alert("Vul alles in met geldige gegevens.");
    }
  }

  async logoutMethod(){
    this.setState({
      username: "",
      Email: "",
      Woonplaats: "",
      Password: "",
      loggedIn: false,
      ToSagreed: false
    });
    console.log(this.state);
    await AsyncStorage.setItem("identity", JSON.stringify({
      username: "",
      Email: "",
      Woonplaats: "",
      Password: "",
      loggedIn: false,
      ToSagreed: false
    }));
    console.log(JSON.parse(await AsyncStorage.getItem("identity")));
  }

  render() {
    return this.state.loggedIn == false || this.state.loggedIn == undefined ? (
      <View style={styles.container}>
        <TextInput
          value={this.state.username}
          onChangeText={username => this.setState({ username })}
          placeholder={"Volledige naam"}
          style={styles.input}
        />
        <TextInput
          value={this.state.Email}
          onChangeText={Email => this.setState({ Email })}
          placeholder={"Email"}
          style={styles.input}
        />
        <TextInput
          value={this.state.Woonplaats}
          onChangeText={Woonplaats => this.setState({ Woonplaats })}
          placeholder={"Woonplaats"}
          style={styles.input}
        />
        <TextInput
          value={this.state.password}
          onChangeText={Password => this.setState({ Password })}
          placeholder={"Wachtwoord"}
          style={styles.input}
          secureTextEntry={true}
        />
        <CheckBox
          title={"Je gaat akkoord met de"}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={this.state.ToSagreed}
          onPress={() => this.setState({ToSagreed: !this.state.ToSagreed})}
        />
        <Text style={{fontSize: 20, color: '#0645AD', textDecorationLine: 'underline'}} onPress={this._handlePressButtonAsync}>Algemene Voorwaarden</Text>
        <Button
          title={"Login"}
          style={styles.input}
          onPress={() => this.LoginMethod(false)}
          color= '#381596'
        />
        <Text style={{fontSize: 20}}>Of</Text>
        <Button
          title={"Aanmelden"}
          style={styles.input}
          onPress={()=> this.signUpMethod()}
          color= '#381596'
        />
      </View>
    ) : (
      <AppContainer screenProps={{ logout: this.logoutMethod.bind(this) }}/>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Details: Profile
  },
  {
    headerMode: "none",
    navigationOptions: {
      headerVisible: false
    }
  }
);

const AppContainer = createAppContainer(RootStack);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eeddec"
  },
  input: {
    width: 225,
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: "#140c44",
    marginBottom: 10,
  }
});
