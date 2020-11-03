"use strict";
/*
  리팩토링 해야하는 사항
  1. data와 logic의 엄격한 구별
  2. 게임 패베와 승리에 대한 promise를 이용한 비동기적인 코드 작성
  3. 필요없고 겹치는 부분 삭제
  4. 게임 실패시 타이머가 멈춰야함

  삽질 한 부분
  1. 2차원 배열 생성 부분
  2. 왼쪽 클릭 리스너 생성 부분
    => contextmenu 라는 method를 호출해야 했던 것. 클릭에서 분기처리를 하는 것이 아닌
  3. visibility 부분 
    => 구현 방법 : childNode를 가져와서 그것의 visiblity를 visible로 만들기
    => childNode 를 가져오면 Nodelist 형태이므로 배열의 첫번째를 가져오는 형태여야 함
  4. grid의 id를 가져올려고 함 => 매우 어려움 (addEventListener로 구현하기 어려움)
    => className으로 가져오면 편함
    => grid안의 Text를 div 처리한지를 까먹고, Text에 class를 부여했다가 삽질을 했음
    => 또한 innerText를 ' '로 설정했더니 condition operator가 정상작동하지 않음
      => innerText를 0으로 설정하고, 0인경우엔 innerText의 visibility를 hidden으로 유지하게 구현
  5. js에선 Number의 type밖에 없으므로, integer와 integer를 나눈다고 해서 integer가 나오지 않음
    => Math.floor() 로 구현
*/
// 기본 Data
const level = {
  초급: [10, 10, 10],
  중급: [15, 15, 20],
  고급: [20, 20, 40],
  "사용자 설정": null,
};
let row, col;
let gameData = {
  selectLevel: null,
  flagCnt: 0,
  bombCnt: 0,
  time: 0,
  blankCnt: 0,
};
let DomData={};
let dir = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
let visited;
const gameDataProxy = new Proxy(gameData, {
  set: (target, key, value) => {
    if (key === "flagCnt")
      document.getElementById("flag_data").innerText = `🚩${value}`;
    else if (key === "bombCnt")
      document.getElementById("bomb_data").innerText = `💣${value}`;
    else if (key === "time")
      document.getElementById("time_data").innerText = `시간${value}`;
    else if (key==="selectLevel" && value==="사용자 설정")
      createCustomField();
    target[key] = value;
    return true;
  },
  get :(target,name)=>{
    return name in target ? target[name] : -1;
  }
});
const domDataProxy =new Proxy(DomData,{
  set:(target,key,value)=>{
    target[key]=value;
    return true;
  }
})

// 1단계 : App
const App = (parent) => {
  // 기본 html 가져오기
  domDataProxy.nav=document.getElementById('nav');
  domDataProxy.header=document.getElementById('header');
  setDefault();
};

const setDefault = ()=>{
  // levelSelect 
  domDataProxy.levelSelect = document.getElementById('level_select');
  domDataProxy.levelSelect.onchange=onLevelChange();
  for(let key in level){
    let levelElt = elt("option",null,key);
    domDataProxy.levelSelect.appendChild(levelElt);
  }
  // start Button
  domDataProxy.startBtn = document.getElementById('startBtn');
  domDataProxy.startBtn.addEventListener("click", onStartBtnClickListener, false);
}

const createCustomField =()=>{
  let customField = elt("div", { id: "custom_Field" });
  // width
  let widthTitle = elt("span", null, "가로");
  widthTitle.style.paddingRight = "1rem";
  let widthInput = elt("input", {
    type: "number",
    id: "rowInput",
    value: 10 
  });
  let customWidth = elt("div", { id: "custom_Width" });
  customWidth.appendChild(widthTitle);
  customWidth.appendChild(widthInput);
  // height
  let heightTitle = elt("span", null, "세로");
  heightTitle.style.paddingRight = "1rem";
  let heightInput = elt("input", {
    type: "number",
    id: "heightInput",
    value: 10,
  });
  let customHeight = elt("div", { id: "custom_Height" });
  customHeight.appendChild(heightTitle);
  customHeight.appendChild(heightInput);
  // bomb
  let bombTitle = elt("span", null, "폭탄");
  bombTitle.style.paddingRight = "1rem";
  let bombInput = elt("input", { type: "number", id: "bombInput", value: 10 });
  let customBomb = elt("div", { id: "custom_Bomb" });
  customBomb.appendChild(bombTitle);
  customBomb.appendChild(bombInput);

  customField.appendChild(customWidth);
  customField.appendChild(customHeight);
  customField.appendChild(customBomb);

  document.body.appendChild(customField);
  domDataProxy.customField=document.getElementById('custom_Field');
}

const onLevelChange = () => {
  gameDataProxy.selectLevel=domDataProxy.levelSelect.value;
};

// 2단계: set&createGame 
const setGame = new Promise((resolve,reject)=>{
  // ** 이 부분을 자동적으로 처리할 수 있게 만드는 코드가 필요
  gameDataProxy.selectLevel=domDataProxy.levelSelect.value;
  if(gameDataProxy.selectLevel==="사용자 설정"){
    row = parseInt(domDataProxy.rowInput.value);
    col = parseInt(domDataProxy.heightInput.value);
    gameDataProxy.bombCnt=parseInt(domDataProxy.bombInput.value);
  } else{
    row = level[selectLevel][0];
    col = level[selectLevel][1];
    gameDataProxy.bombCnt=level[selectLevel][2];
  }
  if (row*col<gameDataProxy.bombCnt) reject(new Error("폭탄이 너무 많습니다!"));
  else resolve();
});

// ** width와 height를 받아올 수 있게 만들어야함
const createGame = new Promise((resolve)=>{
  //selectLevel이 있을 경우
  if(domDataProxy.levelSelect!=-1)
    domDataProxy.levelSelect.remove();
  let game= elt("table",null);
  const trWidth = width/ gameDataProxy.col;
  const trHegiht = height / gameDataProxy.row;
  const bombArr = createBomb(gameDataProxy.row,gameDataProxy.col,gameDataProxy.bombCnt);
  for(let ypos=0;ypos<gameDataProxy.row;ypos++){
    let tr = elt("tr",{height:`${trHegiht}px`})
    for(let xpos=0;xpos<gameDataProxy.col;xpos++){
      let element = elt("td",{
        width: `${trWidth}px`,
        id: `${ypos}_${xpos}`,
      });
      let elText = elt("span",{
        value: `${bombArr[ypos][xpos]}`
      });
      element.appendChild(elText);
      element.addEventListener("click",gridClickListener,false);
      element.addEventListener("contextmenu",gridRightClickListener,false);
      row.appendChild(element);
    }
  }

  let info = elt("div",{id:"game_info"});
  let flag = elt("div", { id: "flag_data" }, `🚩 ${gameDataProxy.flagCnt}`);
  let bomb = elt("div", { id: "bomb_data" }, `💣 ${gameDataProxy.bombCnt}`);
  let timer = elt("div", { id: "time_data" }, `시간 ${gameDataProxy.time}`);
  info.appendChild(flag);
  info.appendChild(bomb);
  info.appendChild(timer);

  resolve({game,info});
})

const createBomb = () => {
  let temp = new Array();
  for (let i = 0; i < gameDataProxy.bombCnt; i++) temp.push("💣");
  for (let i = 0; i < row * col - gameDataProxy.bombCnt; i++) temp.push("0");
  // shuffle
  for (let i = temp.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[j]] = [temp[j], temp[i]];
  }
  let ret = Array.from(Array(row), () => new Array(col));
  temp.forEach((value, idx) => (ret[Math.floor(idx / row)][idx % row] = value));
  processBomb(ret);
  return ret;
};

const processBomb = (arr) => {
  for (let i = 0; i < row; i++)
    for (let j = 0; j < col; j++) {
      if (arr[i][j] === "💣") continue;
      let cnt = 0;
      dir.forEach((value) => {
        let ny = i + value[0],
          nx = j + value[1];
        if (0 <= ny && ny < row && 0 <= nx && nx < col)
          if (arr[ny][nx] == "💣") cnt++;
      });
      arr[i][j] = cnt ? `${cnt}` : "0";
    }
};


// ** 사실 게임 종료 조건이 즉각적이진 않음 (10ms마다 반응하긴 하지만)
// ** 또한 매우 메모리를 많이 잡아먹기도함.
const playGame= new Promise((resolve,reject)=>{
  let timeSet = setInterval(()=>{
      gameDataProxy.time++;
    },1000);
  let checkGameOver = setInterval(()=>{
    if (gameDataProxy.bombCnt == row * col - gameDataProxy.blankCnt){
      clearInterval(timeSet);
      clearInterval(checkGameOver);
      resolve();
    }
    else if(gameDataProxy.isGameOver===false){
      clearInterval(timeSet);
      clearInterval(checkGameOver);
      reject();
    }
  },10);
})

// 그리드 클릭 리스너
const gridClickListener = (e) => {
  // 한번 클릭했으면 다시 클릭을 못하게 해야함 -> DFS 탈출 조건
  if (e.currentTarget.style.backgroundColor === "white") return;
  e.currentTarget.style.backgroundColor = "white";
  let text = e.currentTarget.childNodes[0];
  gameDataProxy.blankCnt++;
  text.innerText=text.value;
  if (text.innerText === "💣") {
    gameDataProxy.isGameOver=false;
    return false;
  } 
  else if (text.innerText === "0") {
    let idName = e.currentTarget.id.split("_");
    let ypos = parseInt(idName[0]);
    let xpos = parseInt(idName[1]);
    let event = document.createEvent("HTMLEvents");
    event.initEvent("click", false, true);
    dir.forEach((value) => {
      let ny = value[0] + ypos,
        nx = value[1] + xpos;
      if (0 <= ny && ny < row && 0 <= nx && nx < col) {
        let nextNode = document.getElementById(`${ny}_${nx}`)[0];
        if (nextNode.childNodes[0].value != "💣")
          nextNode.dispatchEvent(event);
        if (nextNode.childNodes[0].value != "0")
          nextNode.childNodes[0].innerText = nextNode.childNodes[0].value;
      }
    });
  } 
  return true;
};

const gridRightClickListener = (e) => {
  e.preventDefault();
  if(gameDataProxy.flagCnt<=0) return false;
  e.currentTarget.innerText = `🚩`;
  gameDataProxy.flagCnt--;
  return true;
};


// 3단계 : 
const SuccessGame=()=>{
  alert("모든 폭탄을 찾았습니다!! 대단해요!");
}

const FailGame=()=>{
  alert("지뢰를 밟아버렸습니다 😂😂");
}

// 1->2->3단계 : 스타트 버튼
const onStartBtnClickListener =  () => {
  setGame
    .then(()=> createGame)
    .catch((error)=>alert(error))
    .then(({game,info})=> {
      document.bodu.appendChild(domDataProxy.info=info);
      document.body.appendChild(domDataProxy.section=elt("section",null,game));
    })
    .then(()=> playGame)
    .then(()=> SuccessGame)
    .catch(()=> FailGame);
};