// ** DOM에서 만든 element를 그냥 가져오고 싶다. getElementbyID등을 쓰지 않고
export const setData=()=>{
    setInterval(()=>{
        const now= new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        setDigitalClock(seconds,minutes,hours);
        setRoundClock(seconds,minutes,hours%12);
        },1000);
}
    
const setDigitalClock=(seconds,minutes,hours)=>{
    const digitalClock=document.getElementById('digital_clock');
    let isAM = hours<12 ? "오전" : "오후";
    if(isAM==="오후") hours%=12;
    digitalClock.innerText=`${isAM}${hours}시${minutes}분${seconds}초`
}   

const setRoundClock=(seconds,minutes,hours)=>{
    const secHand=document.getElementById('second_hand');
    const minHand=document.getElementById('minute_hand');
    const hourHand=document.getElementById('hour_hand');

    const secondsDegrees=((seconds/60)*360)-90;
    secHand.style.transform=`rotate(${secondsDegrees}deg)`;

    const minsDegrees = ((minutes/60)*360+(seconds/60)*6)-90;
    minHand.style.transform=`rotate(${minsDegrees}deg)`;
    
    const hoursDegrees = ((hours/12)*360+(minutes/60)*30)-90;
    hourHand.style.transform=`rotate(${hoursDegrees}deg)`;
}
