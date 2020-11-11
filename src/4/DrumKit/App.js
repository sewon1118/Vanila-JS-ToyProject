"use strict";
import {setDefault} from "./setDOM.js";
const App=()=>{
    setDefault();
}
const load=()=>{
    App();
}
window.onload=load()