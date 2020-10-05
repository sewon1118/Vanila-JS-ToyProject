"use strict";
const input = document.getElementById("inputNum");
const result = document.getElementById("result");
const restartBtn = document.getElementById("startBtn");
const getRndInteger = (n) => {
    const digits = Array.from({ length: 10 }, (_, i) => i);
    const ret = Array.from({ length: n }, () => {
    const randIndex = Math.floor(Math.random() * digits.length);
    const digit = digits[randIndex];
    digits.splice(randIndex, 1);
    return digit;
  });
  return Number(ret.join(""));
};

const compare = (num1, num2) => {
  let strike = 0,
    ball = 0;
  console.log(num1, num2);
  let arr1 = num1.toString(10).split("").map(Number);
  let arr2 = num2.toString(10).split("").map(Number);
  arr1.forEach((v1, i1) => {
    arr2.forEach((v2, i2) => {
      if (v1 === v2) {
        if (i1 === i2) strike++;
        else ball++;
        return;
      }
    });
  });
  return { strike, ball };
};

let comNum;
const startBtnOnClickListener = () => {
  if (input.disabled === true) input.disabled = false;
  result.innerText="";
  comNum = getRndInteger(4);
};
restartBtn.onclick = startBtnOnClickListener;



input.addEventListener("keyup", (event) => {
  if (event.key=== 'Enter') {
    let inputNum = input.value;
    input.value="";
    let res = compare(inputNum, comNum);
    let tempText = `${inputNum}: `;
    if (res.strike == 0 && res.ball == 0) tempText += "OUT!";
    else if (res.strike == 4) {
        tempText += "숫자를 맞혔습니다!";
        input.disabled=true;
    }
    else tempText += `${res.strike}S ${res.ball}B`;
    tempText+="\r\n";
    result.innerText += tempText;
    return false;
  }
});
