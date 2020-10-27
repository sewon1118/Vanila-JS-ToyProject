"use strict";

const App = (parent, width, height) => {
  let title = elt("h1", null, "지뢰찾기");
  let game = createGame(width, height, 10, 10);
  parent.appendChild(elt("header", null, title));
  parent.appendChild(elt("section", null, game));
};

const createGame = (width, height, gridWidth, gridHeight) => {
  let table = elt("table",null);
  let grid = [];
  const click = (e) => {
    console.log(e);
  };
  for (let ypos = 0; ypos < gridHeight; ypos++) {
    let row = elt("tr", null);
    grid.push([]);
    for (let xpos = 0; xpos < gridWidth; xpos++) {
      grid[ypos].push(0);
      let element = elt("td", null, "1");
      element.addEventListener(
        "click",
        (e) => {
          console.log(e);
        },
        false
      );
      row.appendChild(element);
    }
    table.appendChild(row);
  }
  return table;
};
