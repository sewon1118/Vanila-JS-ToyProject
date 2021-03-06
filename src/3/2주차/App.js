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
let selectLevel;
let gameData = {
  flagCnt: 0,
  bombCnt: 0,
  time: 0,
  blankCnt: 0,
};
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
    /*  
        이 부분을 훨씬 나이스하게 처리하고 싶다
        1. 모든 key값에 대하여 if else문으로 처리하지 않음
        2. 딱 value만 바꾸면 되는데 innerText를 전부 바꿔야하는 문제점
          => HTML DOM TREE 구조 자체를 바꿔야할 듯
    */
    if (key === "flagCnt")
      document.getElementById("flag_data").innerText = `🚩${value}`;
    else if (key === "bombCnt")
      document.getElementById("bomb_data").innerText = `💣${value}`;
    else if (key === "time")
      document.getElementById("time_data").innerText = `시간${value}`;
    target[key] = value;
    return true;
  },
});

// HTML DOM Creation
const App = (parent) => {
  let title = elt("h1", null, "지뢰찾기");
  let nav = elt("nav", null);
  let informationBar = createInfo();
  informationBar.forEach((value) => nav.appendChild(value));
  parent.appendChild(elt("header", null, title));
  parent.appendChild(nav);
};

const createInfo = () => {
  let ret = new Array();
  // levelSelect
  let levelSelcet = elt("select", {
    onchange: "onLevelChange()",
    id: "level_select",
  });
  for (let key in level) {
    let levelElt = elt("option", null, key);
    levelSelcet.appendChild(levelElt);
  }
  ret.push(levelSelcet);

  // custom Size
  let customSize = elt("div", { id: "custom_Field" });
  let widthTitle = elt("span", null, "가로");
  widthTitle.style.paddingRight = "1rem";
  let widthInput = elt("input", { type: "number", id: "rowInput", value: 10 });
  let customWidth = elt("div", { id: "custom_Width" });
  customWidth.appendChild(widthTitle);
  customWidth.appendChild(widthInput);

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

  let bombTitle = elt("span", null, "폭탄");
  bombTitle.style.paddingRight = "1rem";
  let bombInput = elt("input", { type: "number", id: "bombInput", value: 10 });
  let customBomb = elt("div", { id: "custom_Bomb" });
  customBomb.appendChild(bombTitle);
  customBomb.appendChild(bombInput);

  customSize.appendChild(customWidth);
  customSize.appendChild(customHeight);
  customSize.appendChild(customBomb);
  customSize.style.visibility = "hidden";
  ret.push(customSize);

  // flag 개수, 지뢰 개수 , timer 설정
  let gameInfo = elt("div", { id: "game_Info" });
  let flag = elt("div", { id: "flag_data" }, `🚩 ${gameDataProxy.flagCnt}`);
  let bomb = elt("div", { id: "bomb_data" }, `💣 ${gameDataProxy.bombCnt}`);
  let timer = elt("div", { id: "time_data" }, `시간 ${gameDataProxy.time}`);
  gameInfo.appendChild(flag);
  gameInfo.appendChild(bomb);
  gameInfo.appendChild(timer);
  gameInfo.style.visibility = "hidden";
  ret.push(gameInfo);

  // start버튼
  let startBtn = elt("button", { value: "start" }, "시작");
  startBtn.addEventListener("click", onStartBtnClickListener, false);
  ret.push(startBtn);
  return ret;
};

// width랑 height를 잘 조절해야 함
const createGame = (width, height) => {
  let game = elt("table", null);
  // grid의 간격 설정
  const trWidth = width / col;
  const trHegiht = height / row;
  // 무작위로 true false가 정해진 갯수만큼 들어있는 배열 가져오기
  const bomb = createBomb(row, col, gameDataProxy.bombCnt);
  for (let ypos = 0; ypos < row; ypos++) {
    let row = elt("tr", { height: `${trHegiht}px` });
    for (let xpos = 0; xpos < col; xpos++) {
      let element = elt("td", {
        width: `${trWidth}px`,
        class: `${ypos}_${xpos}`,
      });
      let elementText = elt("div", null, `${bomb[ypos][xpos]}`);
      elementText.style.visibility = "hidden";
      element.appendChild(elementText);
      element.addEventListener("click", gridClickListener, false);
      element.addEventListener("contextmenu", gridLeftClickListener, false);
      row.appendChild(element);
    }
    game.appendChild(row);
  }
  return game;
};

// listener 설정
/*
  level 설정
  => 불만족스러움. 특히 selectLevel쪽을 이렇게 해야만 하는가에 대한 의문이 있음
  => select DOM의 onchange listener를 이렇게 밖에 설정할 수 없는가에 대한 의문.asdie_body
  => 현재 철저히 DOM을 생성하는 부분과, DOM의 listener부분을 관리하고 있는데, 이렇게 하게 되면 좀 분리되지 않는 느낌 (패턴에 대한 공부??)
*/
const onLevelChange = () => {
  selectLevel = document.getElementById("level_select").value;
  if (selectLevel === "사용자 설정")
    document.getElementById("custom_Field").style.visibility = "visible";
};
/*
  스타트 버튼 리스너
  => 역시 body에 대한 것을 document.getElementbyId로 받아와야하는것이 조금 어려움
  => 애초에 App을 통해 받아오는 property들을 data쪽에 입력하는것도 나쁘지 않을듯 (맞는 패턴인지는 모르겠음)
*/
const onStartBtnClickListener = () => {
  if (!setGame()) return;
  let game = createGame(300, 300);
  document.body.appendChild(elt("section", null, game));
  document.getElementById("custom_Field").style.visibility = "hidden";
  document.getElementById("game_Info").style.visibility = "visible";
  playGame();
};
// 그리드 클릭 리스너
const gridClickListener = (e) => {
  // 한번 클릭했으면 다시 클릭을 못하게 해야함 -> DFS 탈출 조건
  if (e.currentTarget.style.backgroundColor === "white") return;
  e.currentTarget.style.backgroundColor = "white";
  let text = e.currentTarget.childNodes[0];
  gameDataProxy.blankCnt++;
  // visiblity가 visible이 아니면 innerText 자체를 가져오지 못함
  // 따라서 일단 visible로 만들고 0일때만 다시 hidden으로 바꾸는 것으로 구현
  text.style.visibility = "visible";
  if (text.innerText === "💣") {
    alert("지뢰찾기 실패!");
    return;
  } else if (text.innerText === "0") {
    text.style.visibility = "hidden";
    let className = e.currentTarget.className.split("_");
    let ypos = parseInt(className[0]);
    let xpos = parseInt(className[1]);
    let event = document.createEvent("HTMLEvents");
    event.initEvent("click", false, true);
    dir.forEach((value) => {
      let ny = value[0] + ypos,
        nx = value[1] + xpos;
      if (0 <= ny && ny < row && 0 <= nx && nx < col) {
        let nextNode = document.getElementsByClassName(`${ny}_${nx}`)[0];
        nextNode.childNodes[0].style.visibility = "visible";
        if (nextNode.childNodes[0].innerText != "💣")
          nextNode.dispatchEvent(event);
        if (nextNode.childNodes[0].innerText === "0")
          nextNode.childNodes[0].style.visibility = "hidden";
      }
    });
  } else return;
};

const gridLeftClickListener = (e) => {
  e.preventDefault();
  e.currentTarget.innerText = `🚩`;
  gameDataProxy.flagCnt--;
  return false;
};
/*
  게임 설정
*/
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

const setGame = () => {
  selectLevel = document.getElementById("level_select").value;
  if (selectLevel === "사용자 설정") {
    row = parseInt(document.getElementById("rowInput").value);
    col = parseInt(document.getElementById("heightInput").value);
    gameDataProxy.bombCnt = parseInt(
      document.getElementById("bombInput").value
    );
    if (row * col < gameDataProxy.bombCnt) {
      alert("폭탄이 너무 많습니다!");
      return false;
    }
  } else {
    row = level[selectLevel][0];
    col = level[selectLevel][1];
    gameDataProxy.bombCnt = level[selectLevel][2];
  }
  gameDataProxy.flagCnt = gameDataProxy.bombCnt;
  return true;
};

// 시간에 따라서 동기적으로 처리 -> callback 함수를 적절히 이용..?
const playGame = () => {
  let start = setInterval(() => {
    // 우항이 왜 인지는 모르겠으나 NaN 으로 type이 뜨므로 === 을 쓸 수가 없음
    if (gameDataProxy.bombCnt == row * col - gameDataProxy.blankCnt) {
      clearInterval(start);
      alert("지뢰찾기 성공!");
      return;
    }
    gameDataProxy.time++;
  }, 1000);
};
