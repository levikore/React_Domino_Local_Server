import React, { Component } from 'react';

const NUMBERLIMIT = 6;

const Piece = (props) =>{
  const{number1, number2, isHorizontal, isInverted, dimension} = props;

  const transform = `rotate(${GetRotationDegree(isHorizontal, isInverted)}deg)`;
 
  const style = {
      width: dimension,
      height: dimension,
      transform: transform
    };

  return <img src={GetImageUrlByNumbers(number1, number2)} alt={"Error"} style={style}/>;
}

Piece.defaultProps = {
  isHorizontal: false,
  isInverted: false
}

const GetImageUrlByNumbers = (number1, number2) =>{
  var returnValue = null;
  if(number1 <= NUMBERLIMIT && number2 <= NUMBERLIMIT)
  {
    if(number1 < number2)
    {
      returnValue = require(`./PiecesImages/p${number1}_${number2}.svg`) || require(`./PiecesImages/p${number2}_${number1}.svg`);
    }
    else
    {
      returnValue = require(`./PiecesImages/p${number2}_${number1}.svg`) || require(`./PiecesImages/p${number2}_${number1}.svg`);
    }
  }

  return returnValue;
};

const GetRotationDegree = (isHorizontal, isInverted) =>{


  var returnValue = isHorizontal ? 90 : 0;
  returnValue = isInverted ? returnValue + 180 : returnValue;
  return returnValue;
}


export default Piece;



  
