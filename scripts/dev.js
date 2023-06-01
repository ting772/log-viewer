#! node
const child_process = require("child_process");
const kill = require("tree-kill");
const nodemon = require("nodemon");

function startClient() {
  return new Promise((resolve) => {
    const sub_process = child_process.spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["webpack", "server", "--no-open", "--config-name=client"]
    );
    sub_process.stdout.on("data", console.log);
    sub_process.stderr.on("data", console.error);
    sub_process.stdout.setEncoding("utf8");
    sub_process.stderr.setEncoding("utf8");

    sub_process.stdout.on("data", (data) => {
      if (/compiled.*successfully/.test(data)) {
        resolve(); //只能resolve一次
      }
    });
  });
}

function startServer() {
  nodemon("--exec electron ./server/index.js -w server");
  nodemon.on("exit", (e) => {
    //手动关闭了所有的electron窗口，而不是nodemon检测到更新时触发
    if (!e) {
      kill(process.pid);
    }
  });
  //关闭客户端
}

async function run() {
  await startClient();
  await startServer();
}

run();
