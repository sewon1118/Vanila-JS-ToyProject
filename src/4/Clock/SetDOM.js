import {elt} from "./elt.js";
export const setDefault =()=>{
    const header = elt("header",null);
    const section = elt("section",null);
    headerElement().forEach((value)=>header.appendChild(value));
    sectionElement().forEach((value)=>section.appendChild(value));
    document.body.appendChild(header);
    document.body.appendChild(section);
}

const headerElement=()=>{
    const ret = new Array();
    const title = elt("h1",null,"clock");
    ret.push(title);
    return ret;
}

const sectionElement=()=>{
    const ret = new Array();
    const digitalClock = elt("div",{
        class : "digital_clock",
        id : "digital_clock"
    },);
    ret.push(digitalClock);
    const secondHand = elt("div",{
        class : "hand second_hand",
        id : "second_hand",
    });
    const minuteHand = elt("div",{
        class : "hand minute_hand",
        id : "minute_hand",
    });
    const hourHand = elt("div",{
        class : "hand hour_hand",
        id : "hour_hand",
    })
    const roundClock = elt("div",{
        class: "round_clock",
    },secondHand,minuteHand,hourHand);
    ret.push(roundClock);
    return ret;
}