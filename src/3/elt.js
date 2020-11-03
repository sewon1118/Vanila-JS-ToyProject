"use strict";
const elt = (name,attributes,...rest)=>{
    let node = document.createElement(name);
    if(attributes){
        for(let attr in attributes){
            if(attributes.hasOwnProperty(attr)){
                node.setAttribute(attr,attributes[attr]);
            }
        }
    }
    rest.forEach((value)=>{
        let child = value;
        if(typeof value === "string"){
            child = document.createTextNode(child);
        }
        node.appendChild(child);
    })
    return node;
}