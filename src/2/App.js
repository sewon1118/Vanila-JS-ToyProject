const result = document.getElementById("result");
const input = document.getElementById("input");

input.addEventListener("keyup",(event)=>{
    if (event.key=== 'Enter'){
        let el=document.createElement("span");
        el.innerHTML=input.value+"</br>";
        input.value="";
        result.appendChild(el);
        return false;
    }
});