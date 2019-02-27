import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Button, ScrollView, AsyncStorage } from 'react-native';
import Modal from "react-native-modal";
import { CheckBox } from 'react-native-elements'
import * as firebase from 'firebase';

var dataArray = [];

export default class App extends React.Component {
  constructor(){
    super();
    this.state = {
        isModalVisible: false,
        chosenDate: {date: "0", month: "0", year: "0"},
        viewingMonth: new Date().getMonth(),
        viewingYear: new Date().getFullYear(),
        events: [],
        database: {},
        test: {},
        savedEvents: {},
        info: {}
    }
}

componentDidMount(){
  this.init();
}

init = async()=>{
  const d = JSON.parse(await AsyncStorage.getItem("database"));
  const se = JSON.parse(await AsyncStorage.getItem(firebase.auth().currentUser.uid));
  const u = JSON.parse(await AsyncStorage.getItem("identity"));
  if(se == null || se == undefined){
    se = {};
  }
  this.setState({
    database: d,
    savedEvents: se,
    info: u
  });
}

initDataArray(){
  // init the numbers shown on the screen of the agenda
  var $temp = [];
  var E_P = this.getE_P();
  for(var i = 0; i < 42; i++){
    var correction = 0;
    var tempY = this.state.viewingYear;
    var tempM = this.state.viewingMonth;
    if(i+E_P < 1){
      if(tempM-1 < 0){
        tempM = 11;
        tempY -= 1;
      } else {
        tempM -= 1;
      }
      correction = this.getallMaxDays(tempM, tempY);
    } else if(i+E_P > this.getallMaxDays(this.state.viewingMonth)){
      if(tempM+1 > 11){
        tempM = 0;
        tempY += 1;
      }
      correction = -this.getallMaxDays(tempM, tempY);
    }
    $temp.push({date: i+E_P+correction, month: tempM, year: tempY, key: i});
  }
  dataArray = $temp
}

getallMaxDays(month,year){ // returns the maximum days of a month
  var maxDays = [31,28,31,30,31,30,31,31,30,31,30,31];
  if(year % 4 == 0 && month == 1){
    return 29;
  }
  return maxDays[month];
}

getE_P = () =>{ // returns the difference between the index number of the array and the day date number that it needs to represent
  var date = new Date();
  var Q = date.getDay()-date.getDate()%7;
  if(Q < 0){
    Q += 7;
  }

  var yDif = this.state.viewingYear-date.getFullYear();
  var mDif = this.state.viewingMonth-date.getMonth();

  var totalMonthDif = Math.abs(mDif);
  if(yDif < 0){
    totalMonthDif = 12*Math.abs(yDif)-this.state.viewingMonth;
  } else if(yDif > 0){
    totalMonthDif = 12*Math.abs(yDif)+this.state.viewingMonth;
  }

  var days = 0;
  var year = date.getFullYear();
  var month = date.getMonth();
  var correction = 0;
  if(yDif < 0 || (yDif == 0 && mDif < 0)){
    // if you look into the past
    for(var i = 1; i <= totalMonthDif; i++){
      if(month-i+correction < 0){
        year -= 1;
        correction += 12;
      }
      days += this.getallMaxDays(month-i+correction, year);
    }
    Q -= days%7;
    if(Q < 0){
      Q += 7;
    }
  } else if(yDif > 0 || (yDif == 0 && mDif > 0)){
    // if you look into the future
    for(var i = 0; i < totalMonthDif; i++){
      if(month-i+correction > 11){
        year += 1;
        correction += 12;
      }
      days += this.getallMaxDays(month+i-correction, year);
    }
    Q += days%7;
    if(Q > 7){
      Q += 7;
    }
  }

  return 1-Q;
}

  renderItem = (item) =>{
    var today= new Date().getDate()
    var thisyear= new Date().getFullYear()
    var thismonth= new Date().getMonth()
    var textcolor= ''

    var collection = [];
    for(let i in this.state.savedEvents){
        collection.push(Number(this.state.savedEvents[i].date.split("-")[2]));
    }

    if(this.state.viewingMonth==thismonth && this.state.viewingYear==thisyear) {
      if(item.date == today){
        textcolor= '#eeddec'
      } else if(collection.includes(item.date)){
        textcolor = '#ff0000';
      } else {
        textcolor = '#000';
      }
    } else {
      textcolor= '#000';
    }
    return (
      <TouchableOpacity onPress={()=>{this._toggleModal({item});}}
      style={{width: '15%', textAlign: 'center', backgroundColor: '#a46cbc'}}>
      <Text style={{fontSize: 24, color: textcolor, }}> {item.date} </Text>
      </TouchableOpacity>
    );
  }

  signUp4Event = (item)=> {
    // sign up method
    const u = this.state.info;
    
    var name = u.username;
    var name_array = name.split(" ");
    var first_name = name_array[0];
    var last_name = null;
    var last_name_suffix = null;
    if(name_array.length == 2){
       last_name = name_array[1];
    } else if(name_array.length > 2){
      last_name_suffix = "";
      for(let i = 1; i < name_array.length-1; i++){
       last_name_suffix += name_array[i];
      }
      last_name = name_array[name_array.length-1];
    }
    firebase.database().ref("event_sign_ups").child(item.companyName).child(item.sid).child(firebase.auth().currentUser.uid).once("value", su =>{
     if(!su.exists()){
       firebase.database().ref("event_sign_ups").child(item.companyName).child(item.sid).child(firebase.auth().currentUser.uid).update({
           city: u.Woonplaats,
           email: u.Email,
           first_name: first_name,
           last_name: last_name,
           last_name_suffix: last_name_suffix
       });
       alert("U bent nu aangemeld")
     } else {
       firebase.database().ref("event_sign_ups").child(item.companyName).child(item.sid).child(firebase.auth().currentUser.uid).remove();
       alert("U bent nu afgemeld");
     }
     this.forceUpdate();
   });
}

  removeEvent = (item)=>{
    var temp = this.state.savedEvents;
    delete temp[item.sid];
    this.updateSavedEvents(temp);
  }

  renderEvents = (item) =>{
    return (
      <View style={{width: '100%', height: '100%', borderBottomWidth: 2, borderBottomColor: '140c44'}} >
        <Text style={{fontWeight: 'bold', fontSize: 30}}> {item.name} </Text>
        <Text style={{fontSize: 20, fontStyle: 'italic'}}> {item.date} </Text>
        <Text style={{fontSize: 20}}> {item.description} </Text>
        <Button
          title={"aanmelden/afmelden"}
          onPress={()=>this.signUp4Event(item)}
          color= '#8b508e'
        />
        <Text style={{color:'#a46cbc', fontSize: 5}}>spacebetween</Text>
        <Button
          title="verwijder van agenda"
          onPress={()=>this.removeEvent(item)}
          color= '#8b508e'
        />
        <Text style={{color:'#a46cbc', fontSize: 5}}>spacebetween</Text>
      </View>
    );
  }

  _toggleModal = ({item}) =>{
    // togle isModalVisible in state on and off
    $temp = !this.state.isModalVisible;
    this.setState({
      isModalVisible: $temp,
      chosenDate: item
    });
  }
  
  _lastmonth(){ // go a month back in time in the agenda
    var year = this.state.viewingYear;
    var month = this.state.viewingMonth-1;
    if(month == -1){
      year -= 1;
      month = 11;
    }
    this.setState({
      viewingYear: year,
      viewingMonth: month
    });
  }

  _nextmonth(){ // go a month forward in time in the agenda
    var year = this.state.viewingYear;
    var month = this.state.viewingMonth+1;
    if(month == 12){
      year += 1;
      month = 0;
    }
    this.setState({
      viewingYear: year,
      viewingMonth: month
    });
  }

  eventSame(array, event){
    var found = false;
    for(let i in array){// check for genre asswell
      let e = array[i];
      console.log(e, event.sid);
      if(e == event.sid){
          found = true;
          break;
        }
    }
    return found;
  }

  updateSavedEvents = async(newSe)=>{
    await AsyncStorage.setItem(firebase.auth().currentUser.uid, JSON.stringify(newSe));
  }

  render() {
    this.initDataArray();
    var events = [];
    if(this.state.isModalVisible){
      // if outdated by a week or it's not in database
      var bedrijfen = [];
      for(let i in this.state.database){
        bedrijfen.push(this.state.database[i]);
      }
      var evenementen = [];
      for(let i in bedrijfen){
        evenementen.push(bedrijfen[i].data);
      }
      var aev = [];
      for(let i in evenementen){
        let entries = Object.entries(evenementen[i]);
        aev.push(entries[0][0]);
      }
      var tDate = new Date().getDate();
      var tMonth = new Date().getMonth();
      var tYear = new Date().getFullYear();
      if(tMonth == 0){
        // fix the correction
        tMonth = 11;
        tYear--;
      }
      var newSe = this.state.savedEvents;
      for(let n in this.state.savedEvents){
        var temp = this.state.savedEvents[n];
        var eDate = temp.date.split("-");
        if(this.eventSame(aev, temp) && 
        (eDate[0] >= tYear ? true : eDate[1] > tMonth ? true :  Date[1] == tMonth ? true : eDate[2] >= tDate) &&
        this.state.chosenDate.date == eDate[2] && this.state.chosenDate.month+1 == eDate[1] && this.state.chosenDate.year == eDate[0]){
          events.push(this.state.savedEvents[n]);
        }
        if(!(this.eventSame(aev, temp) && 
        (eDate[0] >= tYear ? true : eDate[1] > tMonth ? true :  Date[1] == tMonth ? true : eDate[2] >= tDate))){
          delete newSe[temp.sid];
        }
      }
      this.updateSavedEvents(newSe);
    }
    
    return (
      <View style={styles.container}>
        <View style={styles.con2}>
          <View style={styles.con3}>
            <TouchableOpacity
              onPress={()=>this._lastmonth()}
              color= '#871F78'
            >
              <Text style={{fontSize: 50, textAlign: 'center'}}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={{fontSize: 50, textAlign: 'center'}}> 
            {this.state.viewingMonth+1}-{this.state.viewingYear}
            </Text>
            <TouchableOpacity
              onPress={()=>this._nextmonth()}
              color= '#871F78'
            >
              <Text style={{fontSize: 50, textAlign: 'center'}}>{">"}</Text> 
            </TouchableOpacity>
          </View>
          <View style={styles.con4}>
          <Text style={{fontSize: 21, textAlign: 'center'}}>MA    DI    WO    DO    VR    ZA    ZO</Text>
          </View>
          <FlatList
            data={dataArray}
            renderItem={({item}) => this.renderItem(item)}
            numColumns={7}
            keyExtractor={item=>item.key}
          />
        </View>

          <View style={{ alignItems: 'center', justifyContent: 'center'}}>
            <Modal isVisible={this.state.isModalVisible}>
              <View style={{ height: '90%', width: '100%', borderRadius: 20,
                backgroundColor: '#8b508e'}}>
                  <Text style={{fontSize: 30, alignSelf: 'center'}}>
                    Evenementen:
                  </Text>
                  <View style={{height: '80%', backgroundColor: '#a46cbc', bottom: '-2.5%'}}>
                    <FlatList
                      data={events}
                      renderItem={({item}) => this.renderEvents(item)}
                      keyExtractor={item=>item.sid}
                    />
                  </View>
                  <View style={{bottom: '-2.5%', alignContent: 'center'}}>
                  <Button
                    onPress={()=>{this._toggleModal({date: "0", month: "0", year: "0"});}}
                    title= 'Terug'
                    color= '#8b508e'
                  />
                  </View>
              </View>
            </Modal>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeddec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  con2: {
    top: "28%",
    height: '140%',
    width: '90%',
    backgroundColor: '#a46cbc',
  },
  con3: {
    height: '20%',
    width: '100%',
    backgroundColor: '#381596',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  con4: {
    height: '8%',
    width: '100%',
    backgroundColor: '#8b508e',
    textAlign: 'center',
  }
});
