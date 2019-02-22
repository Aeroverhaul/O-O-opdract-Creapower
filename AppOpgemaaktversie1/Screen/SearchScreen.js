import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Button, ScrollView, AsyncStorage } from 'react-native';
import Modal from "react-native-modal";
import { CheckBox } from 'react-native-elements';
import * as firebase from 'firebase';

var dataArray = [];

export default class App extends React.Component {
  constructor(){
    super();
    this.state = {
        isModalVisible: false,
        isFilterVisible: false,
        chosenDate: {date: "0", month: "0", year: "0"},
        viewingMonth: new Date().getMonth(),
        viewingYear: new Date().getFullYear(),
        events: [],
        database: {},
        test: {},
        provChoices: [
          "Groningen",
          "Friesland",
          "Drenthe",
          "Overijsel",
          "Flevoland",
          "Gelderland",
          "Utrecht",
          "Noord-Holland",
          "Zuid-Holland",
          "Zeeland",
          "Noord-Brabant",
          "Limburg"
        ],
        genreChoices: [],
        provFilter: [],
        genreFilter: [],
        info: {}, // holds the users information
        su: false
    }
}

componentDidMount(){
    this.init();
}

init = async()=>{
  const d = JSON.parse(await AsyncStorage.getItem("database"));
  const g = JSON.parse(await AsyncStorage.getItem("genres"));
  const u = JSON.parse(await AsyncStorage.getItem("identity"));
  this.setState({
    database: d,
    genreChoices: g,
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
    var today= new Date().getDate();
    var thisyear= new Date().getFullYear();
    var thismonth= new Date().getMonth();
    var textcolor= '';

    var bedrijfen = [];
    for(index in  this.state.database){
      bedrijfen.push(this.state.database[index]);
    }
    var evenementen = [];
    for(index in bedrijfen){
      if(bedrijfen[index].data != undefined){
        evenementen.push(bedrijfen[index].data);
      }
    }
    var collection = [];
    for(let i in evenementen){
      for(let j in evenementen[i]){
        collection.push(Number(evenementen[i][j].date.split("-")[2]));
      }
    }
    if(this.state.viewingMonth==thismonth && this.state.viewingYear==thisyear) {
      if(item.date==today){
        textcolor= '#eeddec';
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

  storeEvent = async(item)=>{
    // store event method for agenda
    var savedEvents = JSON.parse(await AsyncStorage.getItem(firebase.auth().currentUser.uid));
    if(savedEvents == null || savedEvents == undefined){
      savedEvents = {};
    }
    savedEvents[item.sid] = item;
    await AsyncStorage.setItem(firebase.auth().currentUser.uid, JSON.stringify(savedEvents));
    alert("toegevoegd!");
  }

  renderEvents = (item) =>{
      return  (
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
            title="Sla op in je agenda"
            onPress={()=>this.storeEvent(item)}
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

  _toggleFilter= ({}) =>{
    $temp = !this.state.isFilterVisible;
    this.setState({
      isFilterVisible: $temp
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

  provRenderItem = ({item})=>{
    return (
      <CheckBox
        title={item.name}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        checked={this.provItemChecked(item).found}
        onPress={() => this.toggleProv(item)}
      />
    );
  }

  genreRenderItem = ({item})=>{
    return(
      <CheckBox
        title={item.name}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        checked={this.genreItemChecked(item).found}
        onPress={() => this.toggleGenre(item)}
      />
    );
  }

  provItemChecked = (item)=>{
    var found = false;
    var index = null;
    for(let i in this.state.provFilter){
      if(this.state.provFilter[i].includes(item.name)){
        found = true;
        index = i;
        break;
      }
    }
    return {found: found, index: index};
  }

  genreItemChecked = (item)=>{
    var found = false;
    var index = null;
    for(let i in this.state.genreFilter){
      if(this.state.genreFilter[i].includes(item.name)){
        found = true;
        index = i;
        break;
      }
    }
    return {found: found, index: index};
  }

  toggleProv = (item) =>{
    const checked = this.provItemChecked(item);
    var newProvFilter = this.state.provFilter;
    if(checked.found){
      newProvFilter.splice(checked.index,1);
    } else {
      newProvFilter.push(item.name);
    }
    this.setState({
      provFilter: newProvFilter
    });
  }

  toggleGenre = (item) =>{
    const checked = this.genreItemChecked(item);
    var newGenreFilter = this.state.genreFilter;
    if(checked.found){
      newGenreFilter.splice(checked.index,1);
    } else {
      newGenreFilter.push(item.name);
    }
    this.setState({
      genreFilter: newGenreFilter
    });
  }

  render() {
    this.initDataArray();
    var events = []; //THIS.STATE.EVENTS put here the events from the database that have the same date as this.state.chosenDate
    // put here that function that does this!
    if(this.state.isModalVisible){
      var bedrijfen = [];
      for(index in  this.state.database){
        bedrijfen.push(this.state.database[index]);
      }
      var evenementen = [];
      var syncCompanyNameList = [];
      for(index in bedrijfen){
        if(bedrijfen[index].data != undefined){
          evenementen.push(bedrijfen[index].data);
          syncCompanyNameList.push(bedrijfen[index].companyName);
        }
      }
      for(i in evenementen){
        for(j in evenementen[i]){
          var eDate = evenementen[i][j].date.split("-");
          if(this.state.chosenDate.date == eDate[2] && this.state.chosenDate.month+1 == eDate[1] && this.state.chosenDate.year == eDate[0]){
            if(this.state.provFilter.includes(evenementen[i][j].provincie)||this.state.provFilter.length == 0){
              // make a check function to filter on genre
              let found = false;
              for(let n in evenementen[i][j].genre){
                if(this.state.genreFilter.includes(evenementen[i][j].genre[n])){
                  found = true;
                  break;
                }
              }
              if(found || this.state.genreFilter.length == 0){
                evenementen[i][j]["sid"] = Object.entries(evenementen[i])[0][0];
                evenementen[i][j]["companyName"] = syncCompanyNameList[i];
                events.push(evenementen[i][j]);
              }
            }
          }
        }
      }
    }

    var provList = [];
    for(let i in this.state.provChoices){ 
      provList.push({name: this.state.provChoices[i], key: i});
    }

    var genreList = [];
    for(let i in this.state.genreChoices){
      genreList.push({name: this.state.genreChoices[i], key: i});
    }
    
    return (
      <View style={styles.container}>
      <Button
        onPress={this._toggleFilter}
        title="Filter"
        color="#381596"
        />
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
        

        <Modal isVisible={this.state.isFilterVisible}>
          <View style={{ alignItems: 'center', justifyContent: 'center',}}>
            <View style={{height: '80%', width: '100%', borderRadius: 20, backgroundColor: '#8b508e'}}>
            <Text style={{fontSize: 30, alignSelf: 'center'}}>Filter:</Text>
              <View style={{height: '80%', width: '100%', backgroundColor: '#a46cbc', bottom: '-5%'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{width: '50%', height: '100%', backgroundColor: '#a46cbc'}}> 
                    <Text style={{fontSize: 20, alignSelf: 'center'}}>Genre:</Text>
                    <FlatList
                      data={genreList}
                      renderItem={(item)=>this.genreRenderItem(item)}
                      keyExtractor={(item)=>item.key}
                    />
                  </View>
                  <View style={{width: '50%', height: '100%', backgroundColor: '#a46cbc'}}> 
                    <Text style={{fontSize: 20, alignSelf: 'center'}}>Regio:</Text>
                    <ScrollView>
                      <FlatList
                        data={provList}
                        renderItem={(item)=>this.provRenderItem(item)}
                        keyExtractor={(item)=>item.key}
                      />
                    </ScrollView>
                  </View>
                </View>
                <Button
                onPress={this._toggleFilter}
                title="Back"
                color="#8b508e"
                />
              </View>
            </View>
          </View>
        </Modal>

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
    top: "20%",
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
