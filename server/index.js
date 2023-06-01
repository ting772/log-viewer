const { WebSocketServer } = require("ws");
const { port, host, pingIdleTime } = require("../config/index");
const { app, BrowserWindow, screen } = require("electron");

if (require("electron-squirrel-startup")) app.quit();

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  let mainWindow = new BrowserWindow({ width, height, title: "log viewer" });
  mainWindow.removeMenu();

  // eslint-disable-next-line no-undef
  if (typeof isProd !== "undefined" && isProd) {
    mainWindow.loadFile("dist/index.html");
  } else {
    mainWindow.loadURL("http://localhost:9000/");
  }

  setTimeout(() => {
    mainWindow.focus();
  }, 200);

  function heartbeat() {
    this.isAlive = true;
  }
  const recvSet = new Set();
  const senderSet = new Set();
  const wss = new WebSocketServer({ port, host });

  /**
   * {
   *    type:"log"|"sources",
   *    [label]:string,
   *    payload:any
   * }
   */
  function pushObjectToReciever(obj, specWs) {
    let arr;
    if (specWs) {
      arr = [specWs];
    } else {
      arr = [...recvSet];
    }
    for (let ws of arr) {
      ws.send(JSON.stringify(obj));
    }
  }

  wss.on("connection", function connection(ws, req) {
    let params = new URLSearchParams(req.url.replace(/^\//, ""));
    let isSender = false;
    if (params.get("recv")) {
      console.debug("add an client into reveiver set");
      recvSet.add(ws);

      //初始时，如果是接收（display）终端就推送一次source列表
      pushObjectToReciever(
        {
          type: "sources",
          payload: [...senderSet],
        },
        ws
      );
    } else {
      isSender = true;
    }

    const { remoteAddress, localFamily } = req.socket;

    const name = params.get("name");
    const label = `${localFamily}[${remoteAddress}]/${
      name ? "(" + name + ")" : ""
    }`;

    //sender
    if (isSender && !senderSet.has(label)) {
      senderSet.add(label);
      pushObjectToReciever({
        type: "sources",
        payload: [...senderSet],
      });
    }

    ws.isAlive = true;
    ws.on("error", console.error);
    ws.on("pong", heartbeat);
    ws.on("close", function ({ code, reason }) {
      console.debug(`an client close,code:${code},reason:${reason}`);
      recvSet.delete(this);
      senderSet.delete(label);
    });

    ws.on("message", function message(data) {
      let { type, payload } = JSON.parse(data.toString());
      if (type == "log") {
        pushObjectToReciever({
          label,
          type,
          payload,
        });
      }
    });
  });

  const interval = setInterval(function ping() {
    console.debug(
      `当前存在${[...wss.clients].reduce((total, ws) => {
        return (total += ws.isAlive ? 1 : 0);
      }, 0)}个客户端`
    );
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, pingIdleTime);

  wss.on("close", function close() {
    clearInterval(interval);
    recvSet.clear();
    senderSet.clear();
  });
});
