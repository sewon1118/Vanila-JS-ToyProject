import {setDefault} from "./SetDOM.js";
import {setData} from "./ClockData.js";
const App =()=>{
    setDefault();
    setData();
};
const load=()=>App();
window.onload=load();