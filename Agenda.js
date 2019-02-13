import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Button, ScrollView } from 'react-native';
import Modal from "react-native-modal";
import { CheckBox } from 'react-native-elements'
import * as firebase from 'firebase';
import firebaseConfig from './firebase_config';

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
        provfilt: [
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
        genrfilt: [
          "naaien",
          "Haken",
          "Quilten",
          "Anders"
        ],
        checkedgen1: true,
        checkedgen2: true,
        checkedgen3: true,
        checkedgen4: true,
        
        checkedreg2: true,
        checkedreg3: true,
        checkedreg4: true,
        checkedreg5: true,
        checkedreg6: true,
        checkedreg7: true,
        checkedreg8: true,
        checkedreg9: true,
        checkedreg10: true,
        checkedreg11: true,
        checkedreg12: true,
        checkedreg13: true,
    }
}

componentDidMount(){
    firebase.initializeApp(firebaseConfig.config);
    firebase.database().ref("database").once("value",  database => {
      this.setState({
        database: database.val()
      });
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
    return (
      <TouchableOpacity onPress={()=>{this._toggleModal({item}); console.log(item)}}
      style={{width: '15%', textAlign: 'center', backgroundColor: '#a46cbc'}}>
      <Text style={{fontSize: 24}}> {item.date} </Text>
      </TouchableOpacity>
    );
  }

  renderEvents = (item) =>{
    return (
      <View style={{width: '100%', height: '100%'}} >
        <Text style={{fontWeight: 'bold', fontSize: 30}}> {item.name} </Text>
        <Text style={{fontSize: 20, fontStyle: 'italic'}}> {item.date} </Text>
        <Text style={{fontSize: 20}}> {item.description} </Text>
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

  _toggleGenN=() =>{
    var $temp = !this.state.checkedgen1;
    this.setState({checkedgen1: $temp})
    var genres= this.state.genrfilt.indexOf("naaien")
    if(genres>-1) {
      this.state.genrfilt.splice(genres, 1)
    } else {
      this.state.genrfilt.push("naaien")
    }
  }
  _toggleGenH=() =>{
    var $temp = !this.state.checkedgen2;
    this.setState({checkedgen2: $temp})
    var genres= this.state.genrfilt.indexOf("Haken")
    if(genres>-1) {
      this.state.genrfilt.splice(genres, 1)
    } else {
      this.state.genrfilt.push("Haken")
    }
  }
  _toggleGenQ=() =>{
    var $temp = !this.state.checkedgen3;
    this.setState({checkedgen3: $temp})
    var genres= this.state.genrfilt.indexOf("Quilten")
    if(genres>-1) {
      this.state.genrfilt.splice(genres, 1)
    } else {
      this.state.genrfilt.push("Quilten")
    }
  }
  _toggleGenA=() =>{
    var $temp = !this.state.checkedgen4;
    this.setState({checkedgen4: $temp})
    var genres= this.state.genrfilt.indexOf("Anders")
    if(genres>-1) {
      this.state.genrfilt.splice(genres, 1)
    } else {
      this.state.genrfilt.push("Anders")
    }
  }

  _toggleReg2=() =>{
    var $temp = !this.state.checkedreg2;
    this.setState({checkedreg2: $temp})
    var regs= this.state.provfilt.indexOf("Groningen")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Groningen")
    }
  }
  _toggleReg3=() =>{
    var $temp = !this.state.checkedreg3;
    this.setState({checkedreg3: $temp})
    var regs= this.state.provfilt.indexOf("Friesland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Friesland")
    }
  }
  _toggleReg4=() =>{
    var $temp = !this.state.checkedreg4;
    this.setState({checkedreg4: $temp})
    var regs= this.state.provfilt.indexOf("Drenthe")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Drenthe")
    }
  }
  _toggleReg5=() =>{
    var $temp = !this.state.checkedreg5;
    this.setState({checkedreg5: $temp})
    var regs= this.state.provfilt.indexOf("Overijsel")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Overijsel")
    }
  }
  _toggleReg6=() =>{
    var $temp = !this.state.checkedreg6;
    this.setState({checkedreg6: $temp})
    var regs= this.state.provfilt.indexOf("Flevoland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Flevoland")
    }
  }
  _toggleReg7=() =>{
    var $temp = !this.state.checkedreg7;
    this.setState({checkedreg7: $temp})
    var regs= this.state.provfilt.indexOf("Gelderland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Gelderland")
    }
  }
  _toggleReg8=() =>{
    var $temp = !this.state.checkedreg8;
    this.setState({checkedreg8: $temp})
    var regs= this.state.provfilt.indexOf("Utrecht")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Utrecht")
    }
  }
  _toggleReg9=() =>{
    var $temp = !this.state.checkedreg9;
    this.setState({checkedreg9: $temp})
    var regs= this.state.provfilt.indexOf("Noord-Holland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Noord-Holland")
    }
  }
  _toggleReg10=() =>{
    var $temp = !this.state.checkedreg10;
    this.setState({checkedreg10: $temp})
    var regs= this.state.provfilt.indexOf("Zuid-Holland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Zuid-Holland")
    }
  }
  _toggleReg11=() =>{
    var $temp = !this.state.checkedreg11;
    this.setState({checkedreg11: $temp})
    var regs= this.state.provfilt.indexOf("Zeeland")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Zeeland")
    }
  }
  _toggleReg12=() =>{
    var $temp = !this.state.checkedreg12;
    this.setState({checkedreg12: $temp})
    var regs= this.state.provfilt.indexOf("Noord-Brabant")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Noord-Brabant")
    }
  }
  _toggleReg13=() =>{
    var $temp = !this.state.checkedreg13;
    this.setState({checkedreg13: $temp})
    var regs= this.state.provfilt.indexOf("Limburg")
    if(regs>-1) {
      this.state.provfilt.splice(regs, 1)
    } else {
      this.state.provfilt.push("Limburg")
    }
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
      for(index in bedrijfen){
        if(bedrijfen[index].data != undefined){
          evenementen.push(bedrijfen[index].data);
        }
      }
      for(i in evenementen){
        for(j in evenementen[i]){
          var eDate = evenementen[i][j].date.split("-");
          var eMonth= eDate[1].split("")
          var genres= evenementen[i][j].genre
          var prov= evenementen[i][j].provincie
          var genrefilter= this.state.genrfilt
          var provfilter= this.state.provfilt
          console.log(evenementen[i][j].provincie)
          if(this.state.chosenDate.date == eDate[2] && this.state.chosenDate.month+1 == eDate[1] && this.state.chosenDate.year == eDate[0]){
            evenementen[i][j]["key"] = j + i*evenementen.length;
            if((genres.indexOf("naaien")>-1 && genrefilter.indexOf("naaien")>-1)||
            (genres.indexOf("Haken")>-1 && genrefilter.indexOf("Haken")>-1)||
            (genres.indexOf("Quilten")>-1 && genrefilter.indexOf("Quilten")>-1)||
            (genres.indexOf("Anders")>-1 && genrefilter.indexOf("Anders")>-1)) {
              if((prov.indexOf("Groningen")>-1 && provfilter.indexOf("Groningen")>-1)||
              (prov.indexOf("Friesland")>-1 && provfilter.indexOf("Friesland")>-1)||
              (prov.indexOf("Drenthe")>-1 && provfilter.indexOf("Drenthe")>-1)||
              (prov.indexOf("Overijsel")>-1 && provfilter.indexOf("Overijsel")>-1)||
              (prov.indexOf("Flevoland")>-1 && provfilter.indexOf("Flevoland")>-1)||
              (prov.indexOf("Gelderland")>-1 && provfilter.indexOf("Gelderland")>-1)||
              (prov.indexOf("Utrecht")>-1 && provfilter.indexOf("Utrecht")>-1)||
              (prov.indexOf("Noord-Holland")>-1 && provfilter.indexOf("Noord-Holland")>-1)||
              (prov.indexOf("Zuid-Holland")>-1 && provfilter.indexOf("Zuid-Holland")>-1)||
              (prov.indexOf("Zeeland")>-1 && provfilter.indexOf("Zeeland")>-1)||
              (prov.indexOf("Noord-Brabant")>-1 && provfilter.indexOf("Noord-Brabant")>-1)||
              (prov.indexOf("Limburg")>-1 && provfilter.indexOf("Limburg")>-1)) {
                events.push(evenementen[i][j]);
              }
            }
          }
        }
      }
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
        <Button
        onPress={this._toggleFilter}
        title="Filter"
        color="#381596"
        />

        <Modal isVisible={this.state.isFilterVisible}>
          <View style={{ alignItems: 'center', justifyContent: 'center',}}>
            <View style={{height: '80%', width: '100%', borderRadius: 20, backgroundColor: '#8b508e'}}>
            <Text style={{fontSize: 30, alignSelf: 'center'}}>Filter:</Text>
              <View style={{height: '80%', width: '100%', backgroundColor: '#a46cbc', bottom: '-5%'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{width: '50%', height: '100%', backgroundColor: '#a46cbc'}}> 
                    <Text style={{fontSize: 20, alignSelf: 'center'}}>Genre:</Text>
                    <CheckBox
                      title='Naaien'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedgen1}
                      onPress={() => this._toggleGenN()}
                    />
                    <CheckBox
                      title='Haken'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedgen2}
                      onPress={() => this._toggleGenH()}
                    />
                    <CheckBox
                      title='Quilten'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedgen3}
                      onPress={() => this._toggleGenQ()}
                    />
                    <CheckBox
                      title='Anders'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedgen4}
                      onPress={() => this._toggleGenA()}
                    />
                  </View>
                  <View style={{width: '50%', height: '100%', backgroundColor: '#a46cbc'}}> 
                    <Text style={{fontSize: 20, alignSelf: 'center'}}>Regio:</Text>
                    <ScrollView>
                    <CheckBox
                      title='Groningen'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg2}
                      onPress={() => this._toggleReg2()}
                    />
                    <CheckBox
                      title='Friesland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg3}
                      onPress={() => this._toggleReg3()}
                    />
                    <CheckBox
                      title='Drenthe'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg4}
                      onPress={() => this._toggleReg4()}
                    />
                    <CheckBox
                      title='Overijsel'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg5}
                      onPress={() => this._toggleReg5()}
                    />
                    <CheckBox
                      title='Flevoland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg6}
                      onPress={() => this._toggleReg6()}
                    />
                    <CheckBox
                      title='Gelderland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg7}
                      onPress={() => this._toggleReg7()}
                    />
                    <CheckBox
                      title='Utrecht'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg8}
                      onPress={() => this._toggleReg8()}
                    />
                    <CheckBox
                      title='Noord-Holland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg9}
                      onPress={() => this._toggleReg9()}
                    />
                    <CheckBox
                      title='Zuid-Holland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg10}
                      onPress={() => this._toggleReg10()}
                    />
                    <CheckBox
                      title='Zeeland'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg11}
                      onPress={() => this._toggleReg11()}
                    />
                    <CheckBox
                      title='Noord-Brabant'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg12}
                      onPress={() => this._toggleReg12()}
                    />
                    <CheckBox
                      title='Limburg'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.checkedreg13}
                      onPress={() => this._toggleReg13()}
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
                      keyExtractor={item=>item.key}
                    />
                  </View>
                  <View style={{bottom: '-2.5%', alignContent: 'center'}}>
                  <Button
                    onPress={()=>{console.log({date: "0", month: "0", year: "0"}); this._toggleModal({date: "0", month: "0", year: "0"});}}
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
    height: '50%',
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
  },
  conday: {

  },
});
