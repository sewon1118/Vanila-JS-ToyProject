"use strict";
/*
  삽질 한 부분
  1. domData 관련
  => page가 upload되면 onStartBtn쪽에 있는 promise가 그냥 실행이 된다 왜지??
    => 개념 숙지 부족,,, promise는 생성 즉시 자동으로 실행이 된다
    =>
  => 그리고 StartBtn을 누른후에도 여전히 nav는 못찾는중
  => row와 col도 마찬가지

  2. JS에서의 함수 호이스팅
  => 보통은 다 된다.
  => 그렇지만 함수 리터럴 / Function 생성자 / 화살표 함수 표현식 으로 정의한 함수는 그 참조를 변수에 할당한 후에 호출 가능
  => 책 256쪽 참고.

  3. Promise 반환 하는 부분
  => 함수가 Promise 자체를 반환하기때문에, 그 함수에서 then과 catch를 이어나가야 한다.
*/
// 기본 Data
const level = {
  초급: [10, 10, 10],
  중급: [15, 15, 20],
  고급: [20, 20, 40],
  "사용자 설정": null,
};
const width =300, height=300;
let gameData = {
  selectLevel: null,
  flagCnt: 0,
  bombCnt: 0,
  time: 0,
  blankCnt: 0,
  row: 0,
  col: 0,
};
let domData={};
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
const domDataProxy =new Proxy(domData,{
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
  domDataProxy.levelSelect.addEventListener("change",onLevelChange,false);
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

  domDataProxy.nav.appendChild(customField);
}

const onLevelChange = () => {
  gameDataProxy.selectLevel=domDataProxy.levelSelect.value;
};

// 2단계: set&createGame 
const setGame = ()=>{
  return new Promise((resolve,reject)=>{
    let info = elt("div",{id:"game_info"});
    let flag = elt("div", { id: "flag_data" }, `🚩 ${gameDataProxy.flagCnt}`);
    let bomb = elt("div", { id: "bomb_data" }, `💣 ${gameDataProxy.bombCnt}`);
    let timer = elt("div", { id: "time_data" }, `시간 ${gameDataProxy.time}`);
    info.appendChild(flag);
    info.appendChild(bomb);
    info.appendChild(timer);
    domDataProxy.nav.appendChild(info);

    // ** 이 부분을 자동적으로 처리할 수 있게 만드는 코드가 필요
    gameDataProxy.selectLevel=domDataProxy.levelSelect.value;
    if(gameDataProxy.selectLevel==="사용자 설정"){
      gameDataProxy.row = parseInt(domDataProxy.rowInput.value);
      gameDataProxy.col = parseInt(domDataProxy.heightInput.value);
      gameDataProxy.bombCnt=parseInt(domDataProxy.bombInput.value);
    } else{
      gameDataProxy.row = level[gameDataProxy.selectLevel][0];
      gameDataProxy.col = level[gameDataProxy.selectLevel][1];
      gameDataProxy.bombCnt=level[gameDataProxy.selectLevel][2];
    }
    if (gameDataProxy.row*gameDataProxy.col<gameDataProxy.bombCnt) reject(new Error("폭탄이 너무 많습니다!"));
    else {
      gameDataProxy.flagCnt=gameDataProxy.bombCnt;
      resolve();
    }
    })
};

const createBomb =  () => {
  let temp = new Array();
  for (let i = 0; i < gameDataProxy.bombCnt; i++) temp.push("💣");
  for (let i = 0; i < gameDataProxy.row * gameDataProxy.col - gameDataProxy.bombCnt; i++) temp.push("0");
  // shuffle
  for (let i = temp.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[j]] = [temp[j], temp[i]];
  }
  // ** promise 자체에 대한 미숙한 사용때문에 계속해서 proxy에서 받아오는것이 잘 안됨
  let ret = Array.from(Array(gameDataProxy.row), () => new Array(gameDataProxy.col));
  temp.forEach((value, idx) => (ret[Math.floor(idx / gameDataProxy.row)][idx % gameDataProxy.row] = value));
  processBomb(ret);
  return ret;
};


const processBomb = (arr) => {
  for (let i = 0; i < gameDataProxy.row; i++)
    for (let j = 0; j < gameDataProxy.col; j++) {
      if (arr[i][j] === "💣") continue;
      let cnt = 0;
      dir.forEach((value) => {
        let ny = i + value[0],
          nx = j + value[1];
        if (0 <= ny && ny < gameDataProxy.row && 0 <= nx && nx < gameDataProxy.col)
          if (arr[ny][nx] == "💣") cnt++;
      });
      arr[i][j] = cnt ? `${cnt}` : "0";
    }
};


// ** width와 height를 받아올 수 있게 만들어야함
const createGame = ()=>{
  return new Promise((resolve)=>{
    let game= elt("table",null);
    const trWidth = width/ gameDataProxy.col;
    const trHegiht = height / gameDataProxy.row;
    // ** 리팩토링이 필요한 부분
    // ** Promise에 있는 함수는 뒤에 있으면 init이 안되있는걸로 간주, 찾지 못함
    const bombArr =  createBomb();
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
        tr.appendChild(element);
      }
      game.appendChild(tr);
    }
    resolve(game);
  })
}





// ** 사실 게임 종료 조건이 즉각적이진 않음 (10ms마다 반응하긴 하지만)
// ** 또한 매우 메모리를 많이 잡아먹기도함.
const playGame= ()=>{
  return new Promise((resolve,reject)=>{
  let timeSet = setInterval(()=>{
      gameDataProxy.time++;
    },1000);
  let checkGameOver = setInterval(()=>{
    if (gameDataProxy.bombCnt == gameDataProxy.row * gameDataProxy.col - gameDataProxy.blankCnt){
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
};

// 그리드 클릭 리스너
const gridClickListener = (e) => {
  // 한번 클릭했으면 다시 클릭을 못하게 해야함 -> DFS 탈출 조건
  if (e.currentTarget.style.backgroundColor === "white") return;
  e.currentTarget.style.backgroundColor = "white";
  let text = e.currentTarget.childNodes[0];
  gameDataProxy.blankCnt++;
  text.innerText=text.getAttribute('value');
  if (text.innerText === "💣") {
    gameDataProxy.isGameOver=false;
    return false;
  } 
  else if (text.innerText === "0") {
    text.innerText=' ';
    let idName = e.currentTarget.id.split("_");
    let ypos = parseInt(idName[0]);
    let xpos = parseInt(idName[1]);
    let event = document.createEvent("HTMLEvents");
    event.initEvent("click", false, true);
    dir.forEach((value) => {
      let ny = value[0] + ypos,
        nx = value[1] + xpos;
      if (0 <= ny && ny < gameDataProxy.row && 0 <= nx && nx < gameDataProxy.col) {
        let nextNode = document.getElementById(`${ny}_${nx}`);
        if (nextNode.childNodes[0].getAttribute('value') != "💣")
          nextNode.dispatchEvent(event);
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


// 3단계 : 게임 종료
const SuccessGame=()=>{
  alert("모든 폭탄을 찾았습니다!! 대단해요!");
}

const FailGame=()=>{
  alert("지뢰를 밟아버렸습니다 😂😂");
}

// 1->2->3단계 : 스타트 버튼
const onStartBtnClickListener =  () => {
  setGame()
    .then(()=> {
      createGame()
      .then((game)=> {
        domDataProxy.section=elt("section",null,game);
        document.body.appendChild(domDataProxy.section);
      })
      .then(()=> playGame())
      .then(()=> SuccessGame())
      .catch((e)=> {
        console.log(e);
        FailGame()
      });
    })
    .catch((error)=>{
      console.log(error);
      alert(error);
    })
};