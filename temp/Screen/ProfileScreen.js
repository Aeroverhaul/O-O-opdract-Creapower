import React from "react";
import { View, Text, Button, AsyncStorage } from "react-native";

// hier komt alle content voor profile pagina:
export default class ProfileScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      so: null
    }
  }

  componentDidMount(){
    this.getInfo();
  }

  getInfo = async() => {
    const s = JSON.parse(await AsyncStorage.getItem("identity"));
    this.setState({
      info: s
    });
  }

  render() {
    var username = null, residence = null, email = null;
    if(this.state.info != undefined){
      username = this.state.info.username;
      residence = this.state.info.Woonplaats;
      email = this.state.info.Email;
    }
    
    return (
      <View>
        <Text style={{fontSize: 20}}>Naam: {username}</Text>
        <Text style={{fontSize: 20}}>Email: {email}</Text>
        <Text style={{fontSize: 20}}>Woonplaats: {residence}</Text>
        <View style={{justifyContent: 'flex-end'}}>
        <Button
          title="Logout"
          onPress={()=>this.props.logout()}
          color= '#140c44'
        />
        </View>
      </View>
    );
  }
}
