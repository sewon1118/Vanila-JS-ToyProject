// ** DOM에서 만든 element를 그냥 가져오고 싶다. getElementbyID등을 쓰지 않고
export const setData=()=>{
    setInterval(()=>{
        const now= new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        setDigitalClock(seconds,minutes,hours);
        setRoundClock()
        },1000);
}
    
const setDigitalClock=(seconds,minutes,hours)=>{
    const digitalClock=document.getElementById('digital_clock');
    let isAM = hours<12 ? "오전" : "오후";
    if(isAM==="오후") hours%=12;
    digitalClock.innerText=`${hours}시${minutes}분${seconds}초`
}   

const setRoundClock=(seconds,minutes,hours)=>{
    const roundClock=document.getElementById('round_clock');
}
