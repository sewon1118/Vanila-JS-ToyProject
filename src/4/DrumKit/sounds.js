"use strict";
export const sound = new Object();
export const instrument =[
    'ClosedHiHat','Cymbal','FloorTom','Kick',
    'LargeTom','OpenHiHat','SmallTom','Snare'
];
instrument.forEach((value)=>sound[`${value}`]=`./sounds/${value}.wav`);
