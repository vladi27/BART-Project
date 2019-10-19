import { createSelector } from "reselect";
import indexOf from "lodash/indexOf";
import findIndex from "lodash/findIndex";
import * as geolib from "geolib";
import createCachedSelector from "re-reselect";
import uniqBy from "lodash/uniq";

const inRange = require("in-range");

const getTrains = (state, props) => state.trains[props.routeNumber];

const getEtas = state => state.etas;

const getWaypoints = (state, props) =>
  state.waypoints[Number(props.routeNumber) - 1];

const getRouteStations = (state, props) =>
  state.routes[props.routeNumber].stations;
const getRouteSchedules = (state, props) =>
  state.schedules[props.routeNumber].obj;

const createInitialPosition = createCachedSelector(
  [getTrains, getEtas, getWaypoints, getRouteStations, getRouteSchedules],
  (trains, etas, waypoints, stations, schedules) => {
    console.log(trains);
    if (trains) {
      const newT = trains.map(train => {
        let minutes = train.minutes;

        if (train.initialPosition) {
          if (minutes === "Leaving") {
            let stationSlice = stations[train.stationIdx].slice;
            let initialCoordinates = stationSlice[0];
            let obj = { initialCoordinates };
            let newTrain = Object.assign({}, train, obj);
            return newTrain;
            // let timeToStation;
            // if (schedules[train.station]) {
            //     timeToStation = schedules[train.station].timeToNextStation;
            // } else {
            //     timeToStation = 5;
            // }
            // let diff = stationSlice.length - Number(timeToStation) * 60;
            // console.log(diff);
            // if (diff > 0) {
            //     let ratio = Math.round(
            //         (stationSlice.length / Number(timeToStation)) * 60
            //     );

            //     if (ratio > 1) {
            //         let selectIndex = ratio;
            //         let delay = null;

            //         let obj = { selectIndex, delay, allMarkers: stationSlice };
            //         let newTrain = Object.assign({}, train, obj);
            //         return newTrain;
            //     } else {
            //         let selectIndex = null;
            //         let delay = null;

            //         let obj = { selectIndex, delay, allMarkers: stationSlice };
            //         let newTrain = Object.assign({}, train, obj);
            //         return newTrain;
            //     }
            // } else if (diff < 0) {
            //     let ratio = Math.round(
            //         (Number(timeToStation) * 60) / stationSlice.length
            //     );

            //     if (ratio > 1) {
            //         let selectIndex = null;
            //         let delay = ratio;

            //         let obj = { selectIndex, delay, allMarkers: stationSlice };
            //         let newTrain = Object.assign({}, train, obj);
            //         return newTrain;
            //     } else {
            //         let selectIndex = null;
            //         let delay = null;

            //         let obj = { selectIndex, delay, allMarkers: stationSlice };
            //         let newTrain = Object.assign({}, train, obj);
            //         return newTrain;
            //     }
            // } else {
            //     let selectIndex = null;
            //     let delay = null;

            //     let obj = { selectIndex, delay, allMarkers: stationSlice };
            //     let newTrain = Object.assign({}, train, obj);
            //     return newTrain;
            // }
          } else if (minutes !== "Leaving") {
            let prevStation = stations[train.stationIdx - 1].stationName;

            let timeToStation = schedules[prevStation].timeToNextStation;
            let ratio = Math.round(Number(minutes) / timeToStation);
            console.log(ratio);
            let stationSlice = stations[train.stationIdx - 1].slice;
            let newSlice;
            let newRatio;
            let slice1 = stationSlice.slice(1);
            let slice2 = stationSlice.slice(
              Math.round(stationSlice.length / 4)
            );

            let slice3 = stationSlice.slice(
              Math.round(stationSlice.length / 2)
            );
            let slice4 = stationSlice.slice(
              Math.round(stationSlice.length - stationSlice.length / 4) + 1
            );

            if (inRange(ratio, { start: 0, end: 0.25 })) {
              newSlice = slice1;
              newRatio = 0;
            } else if (inRange(ratio, { start: 0.26, end: 0.5 })) {
              newSlice = slice2;
              newRatio = 0.25;
            } else if (inRange(ratio, { start: 0.51, end: 0.75 })) {
              newSlice = slice3;
              newRatio = 0.5;
            } else if (inRange(ratio, { start: 0.76, end: 1.5 })) {
              newSlice = slice4;
              newRatio = 0.75;
            } else {
              newSlice = slice2;
            }
            let initialCoordinates = newSlice[0];

            let obj = {
              initialCoordinates
            };
            let newTrain = Object.assign({}, train, obj);
            return newTrain;
          }
        } else {
          return train;
        }
      });
      return newT;
    }
  }
)((state, props) => props.routeNumber);

export default createInitialPosition;