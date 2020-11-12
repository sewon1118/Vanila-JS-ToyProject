"use strict";
import {elt} from "./elt.js";
import {sound,instrument} from "./sounds.js";
export const setDefault=()=>{
    setDefaultDOM();
    setBackGroundImg();
};

const setDefaultDOM=()=>{
    const header = elt("header",null);
    const container=elt("div",{
        class: "container",
    });
    headerElement().forEach((value)=>header.appendChild(value));
    containerElement().forEach((value)=>container.appendChild(value));
    document.body.appendChild(header);
    document.body.appendChild(container);
};

const headerElement=()=>{
    let ret =new Array();
    const title = elt("h1",null,"Drum Kit");
    ret.push(title);
    return ret;
}

const containerElement=()=>{
    let ret = new Array();
    instrument.forEach((value)=>{
        const text = elt("div",{
            id : `${value}`,
            class : "item_text"
        },`${value}`);
        text.addEventListener("click",soundItemClickListener,false);
        text.addEventListener("transitionend",removeListener,false);
        const item =elt("div",{
            class : "container_item"
        },text);
        ret.push(item);
    });
    return ret;
}

const setBackGroundImg=()=>{
    // document.body.style.backgroundImage="url(drumBackGround.jpg)";
    // document.body.style.filter=" blur(8px)";
}

// Listener
const soundItemClickListener=(e)=>{
    const target =e.currentTarget;
    target.classList.add('playing');
    const id = target.id;
    const curAudio= new Audio(`${sound[id]}`);
    curAudio.play();
}

const removeListener=(e)=>{
    if (e.propertyName !== 'transform') return;
    e.target.classList.remove('playing');
}