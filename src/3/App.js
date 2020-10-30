"use strict";
// 기본 Data
const level={
  "초급" : [10,10,10],
  "중급" : [15,15,20],
  "고급" : [20,20,40],
  "사용자 설정" : null,
}
let row, col;
let selectLevel;
let flagCnt, bombCnt, time;

// HTML DOM Creation
const App = (parent) => {
  let title = elt("h1", null, "지뢰찾기");
  let informationBar = createInfo();
  parent.appendChild(elt("header", null, title));
  let nav = elt("nav",null);
  informationBar.forEach((value)=>{
    nav.appendChild(value);
  })
  parent.appendChild(nav);
};

const createInfo = () => {
  let ret = new Array();
  // levelSelect
  let levelSelcet = elt("select",{onchange:"onLevelChange()", id:"level_select"});
  for(let key in level){
    let levelElt=elt("option",null,key);
    levelSelcet.appendChild(levelElt);
  }
  ret.push(levelSelcet);

  // custom Size
  let customSize =elt("div",{id:"custom_Field"});
  let widthTitle = elt("span",null,"가로");
  widthTitle.style.paddingRight="1rem";
  let widthInput = elt("input",{type:"number",id:"rowInput",value:10});
  let customWidth =elt("div",{id:"custom_Width"});
  customWidth.appendChild(widthTitle);
  customWidth.appendChild(widthInput);

  let heightTitle =elt("span",null,"세로");
  heightTitle.style.paddingRight="1rem";
  let heightInput =elt("input",{type:"number",id:"heightInput",value:10});
  let customHeight = elt("div",{id:"custom_Height"});
  customHeight.appendChild(heightTitle);
  customHeight.appendChild(heightInput);

  let bombTitle = elt("span",null,"폭탄");
  bombTitle.style.paddingRight="1rem";
  let bombInput = elt("input",{type:"number",id:"bombInput",value:10});
  let customBomb = elt("div",{id:"custom_Bomb"});
  customBomb.appendChild(bombTitle);
  customBomb.appendChild(bombInput);
  
  customSize.appendChild(customWidth);
  customSize.appendChild(customHeight);
  customSize.appendChild(customBomb);
  customSize.style.visibility="hidden";
  ret.push(customSize);

  // flag 개수, 지뢰 개수 , timer 설정
  let gameInfo = elt("div",{id:"game_Info"});
  let flag = elt("div",null,`🚩 ${flagCnt}`);
  let bomb = elt("div",null,`💣 ${bombCnt}`);
  let timer = elt("div",null,`시간 ${time}`);
  gameInfo.appendChild(flag);
  gameInfo.appendChild(bomb);
  gameInfo.appendChild(timer);
  gameInfo.style.visibility="hidden";
  ret.push(gameInfo);

  // start버튼
  let startBtn = elt("button",{value: "start"},"시작");
  startBtn.addEventListener("click",onStartBtnClickListener,false);
  ret.push(startBtn);
  return ret;
};

const createGame = (width,height) => {
  let game = elt("table", null);
  // grid의 간격 설정
  const trWidth = width / col;
  const trHegiht = height / row;
  // 무작위로 true false가 정해진 갯수만큼 들어있는 배열 가져오기
  const bomb = createBomb(row, col, bombCnt);

  for (let ypos = 0; ypos < row; ypos++) {
    let row = elt("tr", { height: `${trHegiht}px` });
    for (let xpos = 0; xpos < col; xpos++) {
      let element = elt("td", { width: `${trWidth}px` });
      element.addEventListener("click", gridClickListener, false);
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
const onLevelChange =()=>{
  selectLevel=document.getElementById("level_select").value;
  if(selectLevel==="사용자 설정")
    document.getElementById("custom_Field").style.visibility="visible";
}
/*
  스타트 버튼 리스너
  => 역시 body에 대한 것을 document.getElementbyId로 받아와야하는것이 조금 어려움
  => 애초에 App을 통해 받아오는 propery들을 data쪽에 입력하는것도 나쁘지 않을듯 (맞는 패턴인지는 모르겠음)
*/
const onStartBtnClickListener=()=>{
  setGame();
  let game = createGame(300, 300);
  document.body.appendChild(elt("section", null, game));
  document.getElementById('custom_Field').style.visibility="hidden"
  document.getElementById('game_Info').style.visibility="visible";
}
// 그리드 클릭 리스너
const gridClickListener = (e) => {
  e.currentTarget.style.backgroundColor = "white";
};

/*
  게임 설정
*/
const createBomb = (row, col, bombCnt) => {
  let ret = Array.from(Array(row), () => new Array(col));
  return ret;
};

const setGame = ()=>{
  selectLevel=document.getElementById("level_select").value;
  if(selectLevel==="사용자 설정"){
    row = document.getElementById('rowInput').value;
    col = document.getElementById('heightInput').value;
    bombCnt =document.getElementById('bombInput').value;
  }
  else {
    row=level[selectLevel][0];
    col=level[selectLevel][1];
    bombCnt=level[selectLevel][2];
  }
}

