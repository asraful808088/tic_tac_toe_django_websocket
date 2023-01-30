const clickBox = document.getElementsByClassName("clickBox");
const meSign = document.getElementsByClassName("meSign");
const oppositeSign = document.getElementsByClassName("opposite");
const opositeTime = document.getElementById("opositeTime");
const meTime = document.getElementById("meTime");
const meHtmlMark = document.getElementById("meName");
const otherHtmlMark = document.getElementById("otherName");
const cover = document.getElementById("cover");
const alerthtml = document.getElementById("alert");
const winername = document.getElementById("winer-name");
const winer_tag = document.getElementById("winer-tag");
const inputMeName = prompt("Enter Your name");
meHtmlMark.innerHTML = inputMeName;
const opposite = "2";
const meValue = "1";
let otherName = "";
let meID = "";
let init_game;
let timeTrack;
let clickable = false;
const params = JSON.parse(document.getElementById("params").textContent);
const ws = new WebSocket(`ws://${location.host}/ws/game/${params}`);
function reloadPage() {
  location.reload();
}
ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "init",
    })
  );
};
ws.onmessage = (e) => {
  const jsondata = JSON.parse(e.data);
  console.log(jsondata);
  if (jsondata.type === "init") {
    meID = jsondata.user_id;
    cover.style.display = "block";
    init_game = true;
  } else if (jsondata.type === "join_both") {
    cover.style.display = "none";
    meID = jsondata.user_id;
    ws.send(
      JSON.stringify({
        type: "join_both",
        name: inputMeName,
        user_id: meID,
      })
    );
  } else if (jsondata.type === "init_send_info" && meID != jsondata.user_id) {
    otherName = jsondata.otherName;
    otherHtmlMark.innerHTML = otherName;
    ws.send(
      JSON.stringify({
        type: "init_send_info",
        name: inputMeName,
        user_id: meID,
      })
    );
  } else if (
    jsondata.type === "opponent_send_info" &&
    meID != jsondata.user_id
  ) {
    otherName = jsondata.otherName;
    otherHtmlMark.innerHTML = otherName;
    ws.send(
      JSON.stringify({
        type: "start_game",
      })
    );
  } else if (jsondata.type === "start_game") {
    start_game();
  } else if (jsondata.type === "clickBox" && meID != jsondata.user_id) {
    cover.style.display = "none";
    init_game = false;
    checkBox(false, jsondata.index, true);
    clearInterval(timeTrack);
    opositeTime.innerHTML = "20";
    meTime.innerHTML = "20";
    if (isDrow() != 0) {
      ws.send(
        JSON.stringify({
          type: "spatial_alert",
          name: "drow",
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "start_game",
        })
      );
    }
  } else if (jsondata.type === "spatial_alert") {
    if (jsondata["name"] == "drow") {
      winer_tag.style.display = "none";
    }
    winername.innerHTML = jsondata["name"];
    alerthtml.style.display = "flex";
    clearInterval(timeTrack);
    console.log("dis");
    ws.close();
  } else if (jsondata.type === "disconnect") {
    winername.innerHTML = "opponent disconnect";
    winer_tag.style.display = "none";
    alerthtml.style.display = "flex";
    clearInterval(timeTrack);

    setTimeout(() => {
      location.reload();
    }, 5000);
    ws.close();
  }
};
function start_game() {
  if (!init_game) {
    startTime(true);
  } else {
    startTime(false);
  }
}
function initState() {
  for (let index = 0; index < clickBox.length; index++) {
    clickBox[index].addEventListener("click", () => {
      if (clickable) {
        tab_box(index);
      }
    });
  }
}
function isDrow() {
  for (let index = 0; index < clickBox.length; index++) {
    if (clickBox[index].attributes.value.value == "0") {
      return 0;
    }
  }
  return "drow";
}
function tab_box(index) {
  cover.style.display = "block";
  clickable = false;
  init_game = true;
  opositeTime.innerHTML = "20";
  meTime.innerHTML = "20";
  clearInterval(timeTrack);
  checkBox(false, index, false);
  ws.send(
    JSON.stringify({
      type: "clickBox",
      index: index,
      user_id: meID,
    })
  );
}

function checkBox(init = true, target, oppositeRole = false) {
  for (let index = 0; index < clickBox.length; index++) {
    if (init) {
      clickBox[index].setAttribute("value", 0);
    } else {
      if (
        clickBox[index].attributes.value.value === "0" &&
        index === target &&
        !oppositeRole
      ) {
        clickBox[index].setAttribute("value", 1);
        meSign[index].classList.remove("displayNone");
      } else if (
        clickBox[index].attributes.value.value === "0" &&
        index === target &&
        oppositeRole
      ) {
        clickBox[index].setAttribute("value", 2);
        oppositeSign[index].classList.remove("displayNone");
        const check = isWiner(index, opposite);
        if (check == opposite || check == meValue) {
          let name = "";
          if (check == opposite) {
            name = otherName;
          }
          if (check == meValue) {
            name = inputMeName;
          }
          ws.send(
            JSON.stringify({
              type: "spatial_alert",
              name: name,
            })
          );
        }
      }
    }
  }
}

function isWiner(target, roleValue) {
  for (let index = 0; index < clickBox.length; index += 3) {
    if (
      clickBox[index].attributes.value.value === roleValue &&
      clickBox[index + 1].attributes.value.value === roleValue &&
      clickBox[index + 2].attributes.value.value === roleValue
    ) {
      return roleValue;
    }
  }
  for (let index = 0; index < clickBox.length / 3; index++) {
    if (
      clickBox[index].attributes.value.value === roleValue &&
      clickBox[index + 3].attributes.value.value === roleValue &&
      clickBox[index + 6].attributes.value.value === roleValue
    ) {
      return roleValue;
    }
  }
  if (
    clickBox[0].attributes.value.value === roleValue &&
    clickBox[4].attributes.value.value === roleValue &&
    clickBox[8].attributes.value.value === roleValue
  ) {
    return roleValue;
  }
  if (
    clickBox[2].attributes.value.value === roleValue &&
    clickBox[4].attributes.value.value === roleValue &&
    clickBox[6].attributes.value.value === roleValue
  ) {
    return roleValue;
  }

  return 0;
}
checkBox(true);
initState();
function startTime(me = false) {
  if (!init_game) {
    clickable = true;
  }
  counter = 20;
  timeTrack = setInterval(() => {
    if (counter === 0) {
      bot();
    } else {
      if (me) {
        meTime.innerHTML = counter;
      } else {
        opositeTime.innerHTML = counter;
      }
      counter--;
    }
  }, 1000);
}
function bot() {
  while (true) {
    num = Math.floor(Math.random() * 9);
    if (clickBox[num].attributes.value.value === "0") {
      tab_box(num);
      break;
    }
  }
}
