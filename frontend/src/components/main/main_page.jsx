import React, { Component, PureComponent } from "react";
import "leaflet/dist/leaflet.css";
import { Map, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
// import { DropdownMultiple, Dropdown } from "reactjs-dropdown-component";
import Select from "react-select";
import jsonObject from "../../waypoints/all_shapes";
import MapContainer from "./map_container";
import { throws } from "assert";
import WindowedSelect from "react-windowed-select";
import RouteContainer from "./route_container";
import uniq from "lodash/uniq";
import Station from "./stations";
import { components, createFilter } from "react-windowed-select";
import findIndex from "lodash/findIndex";
// const data = require("json!./../../src/waypoints/all_shapes");

const ROUTES4 = {
  1: {
    hexcolor: "#ffff33",
    destination: "Millbrae",
    abbreviation: ["MLBR", "SFIA"],
    direction: "South",
    color: "Yellow"
  },

  2: {
    hexcolor: "#ffff33",
    abbreviation: ["ANTC"],
    destination: "Antioch",
    direction: "North",
    color: "Yellow"
  },

  3: {
    hexcolor: "#ff9933",
    abbreviation: ["RICH"],
    destination: "Richmond",
    direction: "North",
    color: "Orange"
  },

  4: {
    hexcolor: "#ff9933",
    destination: ["Warm Springs"],
    abbreviation: ["WARM"],
    direction: "South",
    color: "Orange"
  },

  5: {
    color: "Green",
    hexcolor: "#339933",
    destination: "Daly City",
    direction: "South",
    abbreviation: ["DALY"]
  },

  6: {
    color: "Green",
    hexcolor: "#339933",
    destination: ["Warm Springs"],
    abbreviation: "WARM",

    direction: "North"
  },

  7: {
    color: "Red",
    hexcolor: "#ff0000",

    destination: "Daly City",
    direction: "South",
    abbreviation: ["DALY", "MLBR"]
  },

  8: {
    color: "Red",
    hexcolor: "#ff0000",

    direction: "North",

    destination: "Richmond",
    abbreviation: ["RICH"]
  }
};

const RouteColors = {
  Yellow: 1,
  Orange: 3,
  Green: 5,
  Red: 7
};

class MainPage extends PureComponent {
  constructor(props) {
    super(props);

    // this.state = {
    //   routes: this.props.routes
    //   // stations: [{longitude: "-43.7833", latitude: "-5.3823"}],
    //   // space_station: {longitude: "-43.7833", latitude: "-5.3823"},
    //   // map : this.mymap,
    //   // marker: this.circleMarker
    // };

    this.state = {
      currentSelections: [],
      etas: {}
    };
    this.renderStops = this.renderStops.bind(this);
    this.drawPolyline = this.drawPolyline.bind(this);
    this.interval = null;
  }

  componentDidMount() {
    const routeIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const routes = this.props.routes;
    // this.props.receiveWayPoints(jsonObject);
    // this.props.fetchSpaceStation();
    // then(response =>
    //   this.setState({ space_station: response.space_station })
    // );
    this.props
      .fetchRoutes()
      .then(response => this.props.fetchStations())
      .then(() => {
        routeIds.map(ele => {
          this.props.fetchRouteStations(ele);
          this.props.fetchRouteSchedules(ele);
        });
      });

    console.count();

    // this.props
    //   .getCurrentEtas()
    //   .then(response => this.setState({ etas: this.props.etas }));

    // this.props.fetchRouteSchedules(1);

    this.props.receiveWayPoints(jsonObject);
    // setTimeout(() => {
    //   this.props.getCurrentEtas("create");
    //   //.then(result => {
    //   //   console.log(result);
    //   //   routeIds.map(id => {
    //   //     let route = this.props.routes[id];
    //   //     let etas = this.props.etas;
    //   //     console.log(route);
    //   //     console.log(etas);
    //   //     this.props.createTrains(route, etas);
    //   //   });
    //   // });
    // }, 3000);

    this.setState({ seconds: 0, fetchData: false, currentSelections: [] });

    // this.interval2 = setInterval(() => {
    //   let current = this.state.currentSelections;

    //   // if (current && current.length > 0) {
    //   //   current.map(ele => {
    //   //     console.log(ele);
    //   //     let route = ele.value;
    //   //     let routes = "update";
    //   //     console.log(route);
    //   //     this.props.getCurrentEtas(routes, route).then(value => {
    //   //       current.map(ele => {
    //   //         return this.props.updateTrains(
    //   //           ele.value,
    //   //           value,
    //   //           this.props.routes[ele.value].stations
    //   //         );
    //   //       });
    //   //     });
    //   //   });
    //   this.props.getCurrentEtas();

    //   // } else {
    //   //   routeIds.map(id => {
    //   //     let index = findIndex(current, function(o) {
    //   //       return o.value == id;
    //   //     });
    //   //     if (index === -1) {
    //   //       this.props.getCurrentEtas("create", id);
    //   //     }
    //   //   });
    //   //   this.props.getCurrentEtas("create");
    //   // }
    // }, 20000);

    // this.interval2 = setInterval(() => {
    //   this.props.getCurrentEtas("update");
    // }, 20000);
    // this.interval3 = setInterval(() => {
    //   if (!current || current.length === 0) {
    //     this.props.getCurrentEtas("create");
    //   }
    // }, 60000);
    // this.interval = setInterval(() => {
    //   let current = this.state.currentSelections;

    //   if (!current || current.length === 0) {
    //     this.props.getCurrentEtas("create");
    //   }
    // }, 60000);

    //   .then(response => this.setState({ stations: response.stations }));
    // this.props
    //   .fetchRouteInfo()
    //   .then(response => this.setState({ route_info: response.route_info }));
    // this.props.fetchInitialStationDataSouth();
    // this.props.fetchInitialStationDataNorth();
  }

  // componentDidMount() {
  //   // this.interval = setInterval(() => this.props.fetchSpaceStation(), 10000);
  //   // this.props.receiveWayPoints(jsonObject);
  // }

  componentDidUpdate(prevState) {
    if (!this.state.currentSelections) {
      console.count();
      this.setState({ fetchData: false, seconds: 0 });
      clearInterval(this.interval);
      this.interval = null;
    } else if (
      !prevState.currentSelections &&
      this.state.currentSelections.length > 0
      // (prevState.currentSelections.length === 0 &&
      //   this.state.currentSelections.length > 0)
    ) {
      console.count();
      this.setState({ fetchData: true });
      // this.interval = setInterval(() => {
      //   console.count();
      //   this.tick();
      //   if (this.state.seconds % 30 === 0) {
      //     this.props.getCurrentEtas();
      //   }
      // }, 10000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    this.setState(prevState => ({
      seconds: prevState.seconds + 1
    }));
  }

  renderStops() {
    const currentRoutes = this.state.currentSelections;
    const routes = this.props.routes;
    const allStations = this.props.allStations;

    const colors = currentRoutes.map(ele => {
      return ROUTES4[ele.value].color;
    });
    console.log(colors);

    const uniques = uniq(colors);
    console.log(uniques);

    const routes2 = uniques.map(ele => routes[RouteColors[ele]]);
    console.log(routes2);

    return routes2.map(route => {
      let hexcolor = route.hexcolor;
      return route.stations.map(ele2 => {
        console.log(ele2);
        let station = allStations[ele2.stationName];
        console.log(station);
        let abbr = station.abbr;
        return (
          <Station station={station} hexcolor={hexcolor} key={abbr}></Station>
        );
      });
    });
  }

  drawPolyline() {
    // console.log(this.state);
    const currentRoutes = this.state.currentSelections;
    const routes = this.props.routes;
    const allStations = this.props.allStations;

    const colors = currentRoutes.map(ele => {
      return ROUTES4[ele.value].color;
    });
    console.log(colors);

    const uniques = uniq(colors);
    console.log(uniques);

    const routes2 = uniques.map(ele => routes[RouteColors[ele]]);
    console.log(routes2);

    return routes2.map(route => {
      let hexcolor = route.hexcolor;
      console.log(hexcolor);
      let waypoints3 = [this.props.waypoints[Number(route.number) - 1]];
      return waypoints3.map(ele => {
        console.log(ele);
        return <Polyline positions={ele.waypoints} key={hexcolor} />;
      });
    });
  }

  //   updateValue(value) {
  //   this.setState({ value: value });
  // },
  // getValue: function() {
  //   if (!this.state.value) {
  //     return 'Some default text';
  //   }
  //   return this.state.value;
  // }

  handleTimer() {
    this.props.getCurrentEtas().then(value => {
      this.setState({ etas: value });
    });
    this.interval = setInterval(() => {
      console.count();
      this.tick();
      if (this.state.seconds % 1 === 0) {
        this.props.getCurrentEtas().then(value => {
          this.setState(prev => {
            if (prev.etas !== value) {
              this.setState({ etas: value });
            }
          });
        });
      }
    }, 15000);
  }

  stopTimer() {
    clearInterval(this.interval);
    this.interval = null;
  }

  handleChange(value) {
    let difference = [];

    // difference = this.state.currentSelections
    //   .slice()
    //   .filter(x => !value.includes(x)); // calculates diff
    // console.log("Removed: ", difference);

    console.log(value);

    this.setState(prev => {
      console.log(prev);
      if (!prev.currentSelections || prev.currentSelections.length === 0) {
        this.handleTimer();
        return { currentSelections: value };
      } else if (prev.currentSelections.length === 1 && !value) {
        {
          this.stopTimer();
          return { currentSelections: value, seconds: 0 };
        }
      }

      console.count();
      return { currentSelections: value };
    });

    console.log(this.state);
    // if (!this.state.currentSelections) {
    //   return this.setState({ fetchData: false });
    // }
  }

  // customFilter() {
  //   createFilter({ ignoreAccents: false });
  // }

  // checkState() {
  //   this.setInterval(() => {
  //   this.state.routes.map(route => (
  //       if (route.selected === true) {

  //       }
  //     ))
  //   }, 500);
  // }
  // shouldComponentUpdate(nextState) {
  //   if (this.state.currentSelections && nextState.currentSelections) {
  //     return (
  //       nextState.currentSelections.length ===
  //       this.state.currentSelections.length
  //     );
  //   }
  // }

  render() {
    const allRoutes = this.props.routes;
    const customFilter = createFilter({ ignoreAccents: false });
    const options = [
      {
        value: "20",
        label: "Oakland Int'l Airport - Coliseum"
      },
      {
        value: "19",
        label: "Coliseum - Oakland Int'l Airport"
      },
      {
        value: "14",
        label: "SFO - Millbrae"
      },
      {
        value: "13",
        label: "Millbrae - SFO"
      },
      {
        value: "12",
        label: "Daly City - Dublin/Pleasanton"
      },
      {
        value: "11",
        label: "Dublin/Pleasanton - Daly City"
      },
      {
        value: "10",
        label: "MacArthur - Dublin/Pleasanton"
      },
      {
        value: "9",
        label: "Dublin/Pleasanton - MacArthur"
      },
      {
        value: "8",
        label: "Millbrae/Daly City - Richmond"
      },
      {
        value: "7",
        label: "Richmond - Daly City/Millbrae"
      },
      {
        value: "6",
        label: "Daly City - Warm Springs/South Fremont"
      },
      {
        value: "5",
        label: "Warm Springs/South Fremont - Daly City"
      },
      {
        value: "4",
        label: "Richmond - Warm Springs/South Fremont"
      },
      {
        value: "3",
        label: "Warm Springs/South Fremont - Richmond"
      },
      {
        value: "2",
        label: "Millbrae/SFIA - Antioch"
      },
      {
        value: "1",
        label: "Antioch - SFIA/Millbrae"
      }
    ];

    const currentSelections = this.state.currentSelections;
    // const options = this.props.allRoutes.map(ele => ele.title);

    const position = [37.844443, -122.252341];
    // console.log(jsonObject);

    console.log(this.state);
    // console.count();
    // console.log(this.props.routes);

    // console.log(allStations);
    // console.log(this.state);

    // const waypoints = jsonObject;

    // console.log(waypoints);

    // console.log(this.props);
    // const customMarker = L.icon({ iconUrl: require('../../assets/images/iss.png')})

    return (
      <div>
        <div className="react-select__menu">
          <WindowedSelect
            options={options}
            isMulti
            values={this.state.currentSelections}
            styles={{ marginBottom: "200px" }}
            placeholder={"hello"}
            className="basic-multi-select"
            classNamePrefix="select"
            filterOption={customFilter}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        {/* <div className="test">
            <DropdownMultiple
              titleHelper="Routes"
              title="Select routes"
              list={this.state.routes}
              toggleItem={this.toggleSelected}
              onClick={e => this.handleChange}
              // toggleItem={this.handleChange}
            />
          </div> */}
        <Map center={position} zoom={11} animate={true}>
          {currentSelections && Object.keys(this.state.etas).length > 0
            ? this.state.currentSelections.map((ele, idx) => {
                let routeNumber = String(ele.value);
                let id = "routeID -" + routeNumber;

                console.log(routeNumber);

                // let routeID = route.routeID;
                // let schedule = this.props.schedules[route.number];
                return (
                  <RouteContainer
                    // route={route}

                    // waypoints={way2}
                    routeNumber={routeNumber}
                    currentColors={this.state}
                    // drawPolyline={this.drawPolyline}
                    // renderStops={this.renderStops}
                    key={id}
                    etas={this.state.etas}
                    seconds={this.state.seconds}
                  />
                );
              })
            : null}
          {currentSelections ? (
            <div>
              {this.renderStops()}
              {this.drawPolyline()}
            </div>
          ) : null}
          <TileLayer url="https://mt1.google.com/vt/lyrs=m@121,transit|vm:1&hl=en&opts=r&x={x}&y={y}&z={z}" />
          />
        </Map>
        ; })
      </div>
    );
  }
}

export default MainPage;

{
  /* <MapContainer
          // stations={allStations}
          currentRoutes={this.state.currentSelections}
          waypoints={this.props.waypoints}
          allStations={this.props.allStations}
          routes={this.props.routes}
          schedules={this.props.schedules}
          fetchStationDepartures={this.props.fetchStationDepartures}
          getCurrentEtas={this.props.getCurrentEtas}
          etas={etas} */
}
