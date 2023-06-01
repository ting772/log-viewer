<template>
  <el-container class="container">
    <el-header class="header">
      <el-select v-model="source" class="m-2" size="large" placeholder="选择源查看" no-data-text="没有数据源接入">
        <el-option v-for="item in sourceList" :key="item" :label="item" :value="item" />
      </el-select>

      <div class="controls">
        <el-button size="large" :icon="clearIcon" type="primary" @click="clearLogList">清除</el-button>
      </div>
    </el-header>
    <el-main>
      <el-scrollbar wrap-class="list-wrapper" ref="refScrollbar">
        <ul class="log-list">
          <li class="log-item" v-for="(log, index) of logList" :key="index">
            {{ index + 1 }}.
            <template v-for="item of log">
              <span class="plain" v-if="item.type == 'plain'">{{ item.data }}</span>
              <vue-json-pretty v-else :data="item.data" deep="0" />
            </template>
          </li>
        </ul>
        <el-button size="large" class="down-arr" :icon="DownIcon" circle @click="toBottomSide" />
        <el-button size="large" class="up-arr" :icon="UpIcon" circle @click="toUpSide" />
      </el-scrollbar>
    </el-main>
  </el-container>
</template>

<script setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import DownIcon from "@/components/downIcon";
import UpIcon from "@/components/upIcon";
import clearIcon from "@/components/deleteIcon";
import { isObject, isArray } from '@/utils/index'

const source = ref(null);
const sourceList = ref([]);
const logList = ref([]);
let logs_all = []
const refScrollbar = ref(null);
let listWrapperEl;
let ws
onMounted(() => {
  listWrapperEl = document.getElementsByClassName("list-wrapper")[0];
  if (ws) return
  ws = new WebSocket("ws://localhost:9100?recv=1");
  ws.onopen = () => {
    console.log("websocket opened");
  };
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data)
    const { type, payload } = data
    switch (type) {
      case 'sources':
        sourceList.value = payload
        break;

      case "log":
        logs_all.push(data)
        data.parsedPayload = payload.map(item => {
          if (isArray(item) || isObject(item)) {
            return {
              type: "json",
              data: item
            }
          } else {
            return {
              type: 'plain',
              data: item
            }
          }
        })

        //如果追踪源匹配
        if (data.label == source.value) {
          //data.payload 数组形式
          logList.value.push(data.parsedPayload)
        }

        break;
    }
  };
  ws.onerror = (err) => {
    console.log("websocket error happened", err);
  };
  ws.onclose = () => {
    console.log("websocket closing");
    ws = null;
  };
});

onUnmounted(() => {
  if (ws) {
    console.log("close ws")
    ws.close();
  }
})

watch(sourceList, (newV) => {
  //如果source列表更新，没有初始源就设定为第一个
  if (newV.length > 0 && !source.value) {
    source.value = newV[0]
  }
})

watch(source, (newV) => {
  logList.value = logs_all.filter(item => item.label == newV).map(item => item.parsedPayload)
})

let lastScrollHeight = 0

watch(
  () => logList.value.length,
  (newV, oldV) => {
    if (newV > oldV) {
      const { scrollTop, clientHeight } = listWrapperEl;
      if (scrollTop + clientHeight >= lastScrollHeight) {
        setTimeout(() => {
          refScrollbar.value.scrollTo(0, listWrapperEl.scrollHeight);
          lastScrollHeight = listWrapperEl.scrollHeight
        }, 50)
      }
    }
  }
);

function toBottomSide() {
  listWrapperEl.scrollTop =
    listWrapperEl.scrollHeight - listWrapperEl.clientHeight;
}

function toUpSide() {
  listWrapperEl.scrollTop = 0;
}

function clearLogList() {
  logList.value = []
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;

  &:deep {

    .down-arr,
    .up-arr {
      position: fixed;
      right: 100px;
      font-size: 28px;
      font-weight: bold;
    }

    .down-arr {
      bottom: 100px;
    }

    .up-arr {
      bottom: 160px;
    }

    .list-wrapper {
      scroll-behavior: smooth;
    }

  }
}

.header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdcdc;
}

.controls {
  margin-left: auto;
  margin-right: 20px;
}

.log-list {
  margin: 0;
  padding: 20px 80px 20px 20px;
  list-style-type: none;
  font-size: 16px;



  .log-item {
    margin-bottom: 10px;
    display: flex;

    &>* {
      margin-right: 20px;
    }

    :last-child {
      margin-right: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .log-item .plain {
    display: inline;
    line-height: 1.5;
    white-space: pre-wrap;
  }
}
</style>
