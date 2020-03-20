import React, { Component } from "react";
import TimeUtils from "./TimeUtils.jsx";
import theme from "./theme.css";

const Statistics = (props) => {
  return (
    <div>
      <h2 id="titleInfo"> Statistics Info </h2>
      {props.isGameOn ? <TimeUtils
        numOfTurns={props.numOfTurns}
        avgTimeOn={props.avgTimeOn}
        isGameOn={props.isGameOn}
        timeBlockGetter={props.timeBlockGetter}
        currentTime={props.currentTime}
        currentAvgTime={props.currentAvgTime}
      /> : ""}
      <p id="Turns"> Turns: {props.numOfTurns} </p>
      <p id="tokenPiece"> Taken from the stock: {props.takeFromTheStock} </p>
      <p id="Score"> Score: {props.score} </p>
    </div>
  );
}

export default Statistics;

