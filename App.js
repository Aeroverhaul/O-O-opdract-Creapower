import React from "react";
import {
  Button,
  TextInput,
  View,
  StyleSheet,
  AsyncStorage,
  CheckBox,
  Text
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Profile from "./Screen/ProfileScreen";
import HomeScreen from "./Screen/HomeScreen";
import { Constants, WebBrowser } from "expo";
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
      CheckedToS: false,
      loggedIn: false
    };
    this.onLogin = this.onLogin.bind(this);
    this._retrieveUser = this._retrieveUser.bind(this);
    this._storeUser = this._storeUser.bind(this);
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
    var info = this.getInformation;
    if (info === true) {
      this.setState({ loggedIn: true });
    } else {
      // firebase.initializeApp(firebaseConfig.config);
    }
  }

  async getInformation() {
    var information = this._retrieveUser;
    if (
      !(information == undefined || information == null || information == {})
    ) {
      this.setState({
        username: information.username,
        Email: information.Email,
        Woonplaats: information.Woonplaats,
        loggedIn: information.loggedIn
      });
      return true;
    } else {
      return false;
    }
  }

  //store data for login
  async _retrieveUser() {
    var state_string = await AsyncStorage.getItem("identity");
    var json = JSON.parse(state_string);
    return json;
  }

  async _storeUser() {
    return await AsyncStorage.setItem("identity", JSON.stringify(this.state));
  }

  onLogin() {
    /* All ur code authenticate and stuff*/
    var mailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (!this.state.loggedIn) {
      if (
        mailRegExp.test(this.state.Email) &&
        this.state.username.length >= 2 &&
        this.state.CheckedToS == true
      ) {
        this.setState({ loggedIn: true });
        this._storeUser();
        /*
        firebase
          .auth()
          .signInWithEmailAndPassword(this.state.Email, this.state.Password)
          .then(res => {
            this.setState({
              loggedIn: true
            });
            this._storeUser;
          })
          .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            alert("Verkeerde naam probeer opniew");
            console.log(this.state.Email, this.state.Password);
            this._storeUser;
          });*/
      } else {
        alert("Verkeerde gegevens, probeer opnieuw");
      }
    }
  }

  render() {
    return this.state.loggedIn == false ? (
      <View style={styles.container}>
        <TextInput
          value={this.state.username}
          onChangeText={username => this.setState({ username })}
          placeholder={"Naam"}
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
          onChangeText={password => this.setState({ password })}
          placeholder={"Wachtwoord"}
          style={styles.input}
          secureTextEntry={true}
        />
        <CheckBox
          value={this.state.CheckedToS}
          onValueChange={() => {
            this.setState({ CheckedToS: !this.state.CheckedToS });
          }}
        />
        <Text onPress={this._handlePressButtonAsync}>Algemene Voorwaarden</Text>
        <Button
          title={"Login"}
          style={styles.input}
          onPress={() => this.onLogin()}
        />
      </View>
    ) : (
      <AppContainer />
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
    borderColor: "black",
    marginBottom: 10
  }
});
