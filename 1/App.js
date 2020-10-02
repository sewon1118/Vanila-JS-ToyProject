'use strict';
const input=document.getElementById('inputNum');
const result=document.getElementById('result');

let getRndInteger=(min, max)=>{
    return Math.floor(Math.random() * (max - min) ) + min;
};

let compare=(num1,num2)=>{
    console.log(num1,num2);
    let map1=new Map(), map2=new Map();
    for(let i=0;i<4;i++){
        map1.set(i,num1%10);
        map2.set(i,num2%10);
        num1=Math.floor(num1/10), num2=Math.floor(num2/10);
    }
    let strike=0, ball=0;
    //using call back
    map1.forEach((value,key)=>{
        let v1 = value;
        let k1 = key;
        map2.forEach((value,key)=>{
            if(v1===value){
                if(key===k1) strike++;
                else ball++;
            }
        }
        )
    })
    return {strike,ball};
}
let comNum = getRndInteger(1000,9999);

input.addEventListener("keyup",(event)=>{
    if(event.keyCode===13){
        let inputNum=parseInt(input.value);
        console.log(typeof(inputNum))
        let a=compare(inputNum,comNum);
        if(a.strike==0 && a.ball==0) result.innerHTML="OUT!";
        else if(a.strike==4) 
            result.innerHTML="숫자를 맞혔습니다!";
        else result.innerHTML=`${a.strike}S ${a.ball}B`;
        return false;
    }
})