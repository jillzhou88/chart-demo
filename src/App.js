import React, {
  Component
} from 'react';
import './App.css';
import data from './assets/nba.json';
import { VictoryLine, VictoryChart, VictoryZoomContainer, VictoryTheme } from 'victory';
import Checkbox from './Components/checkbox';
import moment from 'moment';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      nbaData: [],
      selectedTeam: ['Cleveland Cavaliers'],
      teamArr: [],
      hv: ['Home', 'Visitor'],
      Home: true,
      Visitor: false,
      text: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleSelect(value, checked) {
    let selectTeam = this.state.selectedTeam.slice();

    if(value === 'Home' || value === "Visitor") {
      this.setState({[value]: checked});
    }
    else {
      if(checked) {
        selectTeam.push(value);
      }
      else {
        selectTeam = selectTeam.filter(el => el !== value);
      }
      this.setState({selectedTeam: selectTeam});
    }
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleClick() {
    let lines = this.state.text.split("\n");
    let result = [];
  
    let headers=lines[0].split(",");
  
    for(let i=1;i<lines.length;i++){
  
      let obj = {};
      let currentline=lines[i].split(",");
  
      for(let j=0;j<headers.length;j++){
        if(!isNaN(currentline[j]) && currentline[j] !== '') {
          obj[headers[j]] = parseInt(currentline[j]);
        }
        else {
          obj[headers[j]] = currentline[j];
        }
      }
  
      result.push(obj);
  
    }
    
    console.log(result);
    const teamArr = this.state.teamArr.slice();
    result.forEach(element => {
      if(!teamArr.includes(element['Home/Neutral'])) {
        teamArr.push(element['Home/Neutral']);
      }
      if(!teamArr.includes(element['Visitor/Neutral'])){
        teamArr.push(element['Visitor/Neutral']);
      }
    });

    const nbaUpdateData = JSON.parse(JSON.stringify(this.state.data));
    teamArr.forEach(el => {
      result.forEach(element => {
        // console.log(element);
        if(element['Home/Neutral'] === el || element['Visitor/Neutral'] === el) {
          // console.log('enter');
          let hOrV;
          if(element['Home/Neutral'] === el) {
            hOrV = 'Home';
          }
          else if(element['Visitor/Neutral'] === el) {
            hOrV = 'Visitor';
          }
          nbaUpdateData[el] = nbaUpdateData[el] || [];
          const index = this.binarySearch(nbaUpdateData[el], element['Date']);
          nbaUpdateData[el].splice(index+1, 0, {
            date: element['Date'],
            PTS: element[`${hOrV.charAt(0)}PTS`],
            notes: element['Notes'],
            hOrV: hOrV
          });
        }
      });
    });

    // console.log(nbaUpdateData);

    this.setState({data: nbaUpdateData, teamArr: teamArr});

  }

  binarySearch(list, value) {
    let start = 0;
    let stop = list.length - 1;
    let middle = Math.floor((start + stop) / 2);

    // While the middle is not what we're looking for and the list does not have a single item
    while (!moment(list[middle].date).isSame(value) && start < stop) {
      if (moment(value).isBefore(list[middle])) {
        stop = middle - 1;
      } else {
        start = middle + 1;
      }

      // recalculate middle on every iteration
      middle = Math.floor((start + stop) / 2);
    }

    // if the current middle item is what we're looking for return it's index, else return start
    return (!moment(list[middle].date).isSame(value)) ? start : middle;
  }

  componentWillMount() {
    // const nbaData = this.convertCSVtoJSON(data);
    // console.log(data);
    // this.setState({nbaData: data});
    const teamArr = [];
    data.forEach(element => {
      if(!teamArr.includes(element['Home/Neutral'])) {
        teamArr.push(element['Home/Neutral']);
      }
      if(!teamArr.includes(element['Visitor/Neutral'])){
        teamArr.push(element['Visitor/Neutral']);
      }
    });
    const nbaUpdateData = {};
    teamArr.forEach(el => {
      data.forEach(element => {
        // console.log(element);
        if(element['Home/Neutral'] === el || element['Visitor/Neutral'] === el) {
          // console.log('enter');
          let hOrV;
          if(element['Home/Neutral'] === el) {
            hOrV = 'Home';
          }
          else if(element['Visitor/Neutral'] === el) {
            hOrV = 'Visitor';
          }
          nbaUpdateData[el] = nbaUpdateData[el] || [];
          nbaUpdateData[el].push({
            date: element['Date'],
            PTS: element[`${hOrV.charAt(0)}PTS`],
            notes: element['Notes'],
            hOrV: hOrV
          });
        }
      });
    });
    
    let teamData = {};
    let nbaData = {};
    this.state.selectedTeam.forEach(each => {
      nbaData[each] = nbaUpdateData[each];
    });

    Object.entries(nbaData).forEach(([key, value]) => {
      teamData[key] = [];
      value.forEach(each => {
        if((this.state.Home && each.hOrV === 'Home') || (this.state.Visitor && each.hOrV === 'Visitor')) {
          teamData[key].push(each);
        }
      });
    });

    // console.log("willMount: ",teamData);

    this.setState({data: nbaUpdateData, teamArr: teamArr, nbaData: teamData});
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.Home !== this.state.Home || prevState.Visitor !== this.state.Visitor || prevState.selectedTeam !== this.state.selectedTeam || prevState.data !== this.state.data ) {
      let teamData = {};
      let nbaData = {};
      this.state.selectedTeam.forEach(each => {
        nbaData[each] = this.state.data[each];
      });

      Object.entries(nbaData).forEach(([key, value]) => {
        teamData[key] = [];
        value.forEach(each => {
          if((this.state.Home && each.hOrV === 'Home') || (this.state.Visitor && each.hOrV === 'Visitor')) {
            teamData[key].push(each);
          }
        });
      });

      // console.log("update ",nbaData);
      // console.log(teamData);
      this.setState({nbaData: teamData});
    }
  }

  render() {
    // console.log(this.state.nbaData);
    const teamList = this.state.teamArr.map(team => {
      let isChecked = false;
      this.state.selectedTeam.forEach(each => {
        if(each === team) isChecked = true;
      });
      return <Checkbox value={team} name={team} handleClick={this.handleSelect} key={team} isChecked={isChecked}/>;
    });

    const hv = this.state.hv.map(el => {
      let isChecked = this.state[el];
      return <Checkbox value={el} name={el} handleClick={this.handleSelect} key={el} isChecked={isChecked}/>;
    });

    const lines = Object.entries(this.state.nbaData).map(([key, value]) => {
      return <VictoryLine data={value} x="date" y="PTS" key={key} />;
    });

    return (
      <div className="App">
        <div className="chart">
          <VictoryChart width={1000} height={650} theme={VictoryTheme.material} 
            containerComponent={<VictoryZoomContainer zoomDomain={{y: [60, 140]}} zoomDimension="x"/>}>
            {lines}
          </VictoryChart>
        </div>
        <div className="teamList">
          {teamList}
        </div>
        <div className="hv">
          {hv}
          <hr />
          <textarea value={this.state.text} onChange={this.handleChange}/>
          <button onClick={this.handleClick}>Add Data</button>
          <br />
          <br />
          <p>
            About add text: <br />
            1. Please be careful that the origin csv file header have two "PTS" columns. When converted to JSON objects, the first "PTS" column will be overwritten by the second one. I changed the first "PTS" into "VPTS" and the second into "HPTS". When added text, please modify the header.<br />
            2. Please added the text as csv format
          </p>
          <br />
          <p>
            About chart: <br />
            This x-axis could be zoomed.
          </p>
        </div>
      </div>
    );
  }
}

export default App;