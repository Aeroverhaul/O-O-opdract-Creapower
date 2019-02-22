import React from "react";
import { View, Image, AsyncStorage, Text, Alert, Button, FlatList } from "react-native";
import BottomNavigation, {
  IconTab,
  Badge
} from "react-native-material-bottom-navigation";
import {
  createMaterialBottomTabNavigator,
  createAppContainer
} from "react-navigation";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Profile from "./ProfileScreen";
import Agenda from "./AgendaScreen";
import Search from "./SearchScreen";
import * as firebase from "firebase";
import { Icon } from "react-native-elements";

// hier komt alle content voor de homescreen pagina:
class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      database: {},
      genres: {}
    }
  }

  componentDidMount(){
    if(this.props.refresh){
      //update data
      this.getData();
    }
    this.retrieveData();
  }

  getData = async() => {
    await firebase.database().ref("database").once("value", d => {
      AsyncStorage.setItem("database", JSON.stringify(d.val()));
    });
    await firebase.database().ref("genre").once("value", g => {
      AsyncStorage.setItem("genres", JSON.stringify(g.val()));
    });
  }

  retrieveData = async() => {
    const database = JSON.parse(await AsyncStorage.getItem("database"));
    const genres = JSON.parse(await AsyncStorage.getItem("genres"));
    this.setState({
      database: database,
      genres: genres
    });
  }

  renderCompanyItem = ({item})=>{
    return(
      <View style={{borderColor: '#381596', borderleftWidth: 2, borderRightWidth: 2, borderTopWidth: 1, borderBottomWidth: 1}}>
        <Text style={{fontSize: 20}}>{item.name}</Text>
      </View>
    );
  }

  render() {
    var entries = Object.entries(this.state.database);
    var companyList = [];
    for(let i = 0; i < entries.length; i++){
      companyList.push({name: entries[i][0]});
    }
    return (
      <View>
        <Text style={{fontSize: 30}}>Organisatie lijst:</Text>
        <FlatList
          data={companyList}
          renderItem={(item)=>this.renderCompanyItem(item)}
          keyExtractor={(item)=>item.name}
        />
        {
          // make a flatlist containing all the company names                         DONE
          // make a button that can refresh all the information of the app            DONE
          // make a logout button                                                     DONE
          // make a method of remembering events you assgined for                     TODO 
          // make a button to assign for a event                                      DONE
          // make the filter flexible by using the database information as a filter   DONE
          // make the filter smaller if possible                                      DONE
        }
      </View>
    );
  }
}

/* Dit is voor de navbar aan de onderkant van het scherm*/
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      so: null,
      content: <Home refresh={true}/>
    };
  }

  state = {
    activeTab: "home"
  };

  tabs = [
    {
      key: "home",
      label: "home",
      barColor: "#a46cbc",
      pressColor: "rgba(255, 255, 255, 0.16)",
      icon: "home"
    },
    {
      key: "search",
      label: "search",
      barColor: "#8b508e",
      pressColor: "rgba(255, 255, 255, 0.16)",
      icon: "search"
    },
    {
      key: "agenda",
      label: "agenda",
      barColor: "#381596",
      pressColor: "rgba(255, 255, 255, 0.16)",
      icon: "calendar"
    },
    {
      key: "profile",
      label: "profile",
      barColor: "#140c44",
      pressColor: "rgba(255, 255, 255, 0.16)",
      icon: "user-circle"
    }
  ];

  state = {
    activeTab: this.tabs[0].key
  };

  renderIcon = icon => ({ isActive }) => (
    <FontAwesome size={24} color="white" name={icon} />
  );

  renderTab = ({ tab, isActive }) => (
    <IconTab
      isActive={isActive}
      showBadge={tab.key === "search"}
      renderBadge={() => <Badge>2</Badge>}
      key={tab.key}
      label={tab.label}
      renderIcon={this.renderIcon(tab.icon)}
    />
  );

  ScreenManage = newTab => {
    this.setState({ activeTab: newTab.key });
    if (newTab.key == "home") {
      this.setState({
        content: <Home />
      });
    } else if (newTab.key == "search") {
      this.setState({
        content: <Search />
      });
    } else if (newTab.key == "agenda") {
      this.setState({
        content: <Agenda />
      });
    } else if (newTab.key == "profile") {
      this.setState({
        content: <Profile logout={this.props.screenProps.logout} />
      });
    }
  };

  refresh(){
    this.getData();
  }
  getData = async() => {
    await firebase.database().ref("database").once("value", d => {
      AsyncStorage.setItem("database", JSON.stringify(d.val()));
    });
    await firebase.database().ref("genre").once("value", g => {
      AsyncStorage.setItem("genres", JSON.stringify(g.val()));
    });
  }
  
  render() { 
    return (
      /* Dit is voor het logo boven aan het scherm */
      <View style={{ flex: 1, backgroundColor: "#eeddec" }}>
        <View style={{ height: "10%", backgroundColor: "#a46cbc" }}>
          <Image
            source={require("../img/Creapplogo.png")}
            style={{
              width: 150,
              height: 85,
              bottom: +3
            }}
          />
        </View>
        <Icon
          raised
          name='reload'
          type='material-community'
          color='#000'
          onPress={()=>this.refresh()} />
        {this.state.content}
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Image
            source={require("../img/cut.png")}
            style={{
              resizeMode: "contain",
              width: 412,
              bottom: -172,
              opacity: 0.2
            }}
          />
        </View>
        <BottomNavigation
          tabs={this.tabs}
          activeTab={this.state.activeTab}
          onTabPress={newTab => this.ScreenManage(newTab)}
          renderTab={this.renderTab}
          useLayoutAnimation
        />
      </View>
    );
  }
}
