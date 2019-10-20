import { Map, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import Station from "./stations";
import * as geolib from "geolib";
import merge from "lodash/merge";
import indexOf from "lodash/indexOf";
import findIndex from "lodash/findIndex";
import uniqueId from "lodash/uniqueId";
import debounceRender from "react-debounce-render";
import { divIcon } from "leaflet";
import memoize from "memoize-one";
import styled from "styled-components";
import getPosition from "../../selectors/train_marker_selector";

// import iconTrain from "./map_icon";
import { DriftMarker } from "leaflet-drift-marker";

const uuidv4 = require("uuid/v4");

class TrainContainer extends PureComponent {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.state = {
      markers: null,
      id: null,
      allMarkers: [],
      station: null,
      interval: null,
      seconds: null,
      pos: null,
      start: null,
      currentSlice: [],
      total: null
    };
    this.intervalId = null;

    this.time = {
      start: performance.now()
    };
    this.ref = this.props.getOrCreateRef(this.props.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(prevProps, prevState, this.state, this.props);
    console.log(snapshot);
    console.count();

    if (
      this.props.minutes !== this.state.minutes &&
      this.state.minutes === "Leaving" &&
      this.state.station !== this.props.station
    ) {
      let station = this.props.routeStations[this.props.index].slice;
      console.log(
        this.props.minutes,
        this.state.minutes,
        this.props.station,
        this.state.station
      );
      console.count();
      this.setState({
        minutes: this.props.minutes,
        end: Number(this.props.minutes) * 60 * 1000,
        station: this.props.station
      });

      // this.touched(now, ref);

      console.log(
        this.props.currentSlice,
        this.props.station,
        this.props.minutes
      );

      // this.time["start"] = performance.now();
      this.time["start"] = performance.now();
      setTimeout(() => {
        let now = performance.now();
        this.touched(now);
      }, this.state.interval);

      // let now = performance.now();
      // this.touched(now);

      // this.touched(this.props.pos, this.state.minutes, station);
    } else if (
      this.props.minutes !== this.state.minutes &&
      this.state.minutes !== "Leaving" &&
      this.props.minutes === "Leaving" &&
      this.state.station === this.props.station
    ) {
      console.log(this.props.minutes, this.state.minutes, this.props.station);
      console.count();
      window.cancelAnimationFrame(this.touched());
      this.setState({
        minutes: this.props.minutes,
        end: null,
        interval: this.props.currentSlice.interval,
        //  markers: this.props.currentSlice.shift(),
        currentSlice: this.props.currentSlice.currentSlice
      });

      //this.time.start = null;
      this.time.elapsed = null;
    } else if (this.props.minutes !== this.state.minutes) {
      let diff =
        (Number(this.props.minutes) - Number(this.state.minutes)) * 1000 * 60;
      let timeLeftToCover = this.time.end - this.time.elapsed;
      console.log(
        diff,
        this.time.elapsed,
        this.state.station,
        this.props.minutes
      );
      // waypoints per second = this.state.
      this.setState({ minutes: this.props.minutes });
    }
  }

  touched(now, interval) {
    console.log(this.state.currentSlice, this.props.station);
    console.log(this.time, this.props.station);
    if (this.state.end && this.state.currentSlice.length > 0) {
      console.log(this.state.currentSlice, this.props.station);
      let newSlice = this.state.currentSlice;
      console.count();
      requestAnimationFrame(() => {
        this.time.elapsed = now - this.time.start;
        console.log(this.time.start, this.props.station);
        console.log(this.time.elapsed, this.props.station);
        const progress = this.time.elapsed / this.state.end;
        const position = this.state.currentSlice.shift();
        console.log(this.state.currentSlice, this.props.station);
        console.log(position);
        console.log(progress, this.state.station, newSlice, this.state.minutes);
        // this.ref.current.leafletElement.options.position = position;
        this.setState({ markers: position });

        // console.log(
        //   this.ref.current.leafletElement.options.position,
        //   this.props.station
        // );
        console.log(now, newSlice);
        console.count();
        //  this.setState({ markers: station.shift() });
        // if (this.props.coinShortName == this.state.selectedPostId) {
        //   this.setState({ stateToDisplay: !this.state.stateToDisplay })
        // }

        if (progress < 1 && this.state.currentSlice.length > 0) {
          let now2 = performance.now();
          console.log(newSlice);
          console.count();
          setTimeout(() => {
            this.touched(now2, this.state.currentSlice);
          }, this.state.interval);
        }
      });
    }
  }

  // const element = document.querySelector("span");
  // const finalPosition = 600;

  // const time = {
  //   start: performance.now(),
  //   total: 2000
  // };

  // const tick = now => {
  //   time.elapsed = now - time.start;
  //   const progress = time.elapsed / time.total;
  //   const position = progress * finalPosition;
  //   element.style.transform = `translate(${position}px)`;
  //   if (progress < 1) requestAnimationFrame(tick);
  // };

  // const time = {
  //   start: null,
  //   total: 2000
  // };

  // const tick = now => {
  //   if (!time.start) time.start = now;
  //   time.elapsed = now - time.start;
  //   if (time.elapsed < time.total) requestAnimationFrame(tick);
  // };

  // requestAnimationFrame(tick);

  componentDidMount() {
    const nextStation = this.props.nextStation;

    // const markers = this.state.allMarkers;
    const markers = this.props.markers;

    let end = null;
    let timeObject = new Date();
    console.log(timeObject);

    if (this.props.minutes !== "Leaving") {
      end = Number(this.props.minutes) * 60 * 1000;
    }

    // this.setState(prev => {
    //   console.log(prev);

    //   return { markers: prev.markers };
    // });

    console.log(this.props);

    const interval = this.props.interval;

    this.setState({
      markers: this.props.initialCoordinates,
      // ratio: this.props.ratio,
      station: this.props.station,
      minutes: this.props.minutes,
      start: performance.now(),
      end: end,
      interval: this.props.interval,
      currentSlice: this.props.currentSlice
    });

    // const ref = this.props.getOrCreateRef(this.props.id);

    let now = performance.now();

    // this.touched(now, ref);

    console.log(
      this.props.currentSlice,
      this.props.station,
      this.props.minutes
    );

    if (this.props.minutes !== "Leaving") {
      setTimeout(() => {
        console.count();
        this.touched(now);
      }, this.props.interval);
    }

    // console.log(this.props.station);
    console.count();
  }

  componentWillUnmount() {
    // clearInterval(this.intervalId);
    // clearInterval(this.intervalId2);
    //   clearInterval(this.interval3);
  }

  render() {
    const color = this.props.color;
    const id = this.props.id;
    const ref = this.props.getOrCreateRef(id);

    console.log(pos);
    const styles = ` background-color: ${color}`;

    const iconTrain = divIcon({
      className: `custom-div-icon${color.slice(1)}`,
      html: `<div style="${styles}"></div><i class="fas fa-subway"></i>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    console.log(color);
    console.log(iconTrain);
    console.log(this.props.station, this.props);
    console.log(this.props.markers, this.props.station);
    console.log(this.props.interval);
    console.log(this.state.markers);
    console.log(this.props.key);
    console.log(this.ref);
    console.log(this.state);
    console.log(this.time.start, this.props.station);
    console.log(this.props.minutes, this.state.interval, this.props.station);
    console.log(this.time, this.state.station, this.state.minutes);
    // console.log(this.props.id);
    // const id = uuidv4();

    // if (!this.state.markers) {
    //   return <div></div>;
    // } else {

    let pos = this.state.markers;
    console.log(pos);

    // console.log(id);
    // if (!this.state.markers) {
    //   pos = this.props.markers[0];
    // }
    if (!pos) {
      return <div></div>;
    }
    return (
      <div>
        {pos.length > 0 ? (
          <DriftMarker
            // if position changes, marker will drift its way to new position
            position={pos}
            key={id}
            ref={ref}
            // time in ms that marker will take to reach its destination
            duration={this.state.interval}
            icon={iconTrain}
            // style={{ backgroundColor: `${color}` }}
          >
            {/* <Popup>Hi this is a popup</Popup>
        <Tooltip>Hi here is a tooltip</Tooltip> */}
          </DriftMarker>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  // this.state = { stations: this.props.selectedRoute.stations || [] };
}

const msp = (state, props) => {
  return {
    currentSlice: getPosition(state, props)
  };
};
const mdp = state => {
  return {};
};
const DebouncedTrain = debounceRender(TrainContainer);
export default connect(
  msp,
  mdp
)(TrainContainer);

// export default TrainContainer;
