import React from "react";
import { View, Image, AsyncStorage, Text, Alert, Button } from "react-native";
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

// hier komt alle content voor de homescreen pagina:
class Home extends React.Component {
  render() {
    return (
      <View>
        <Text>Hier komt alles voor de homescreen</Text>
      </View>
    );
  }
}

/* Dit is voor de navbar aan de onderkant van het scherm*/
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      so: null
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
        content: <Profile />
      });
    }
  };

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
