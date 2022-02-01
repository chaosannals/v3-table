<template>
  <div class="appbox">
    <div class="table-box">
      <v3-table :rows="rows">
        <v3-table-column :width="100">
          <template v-slot:head>
            <span>第1列</span>
            <input/>
          </template>
          <template v-slot="{row, index}">
            <button>{{ row.id }} - {{index}}</button>
          </template>
        </v3-table-column>
        <v3-table-column :width="200">
          <template v-slot:head>
            <span>第2列</span>
            <input/>
          </template>
        </v3-table-column>
        <v3-table-column :width="300">
          <template v-slot:head>
            <span>第3列</span>
            <input/>
          </template>
          <v3-button>2</v3-button>
        </v3-table-column>
        <v3-table-column title="第4列" :width="100"></v3-table-column>
        <v3-table-column title="第5列"></v3-table-column>
        <v3-table-column title="第6列"></v3-table-column>
        <v3-table-column title="第7列"></v3-table-column>
      </v3-table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";

const rows = reactive([]);

for (let i = 0; i < 1000; ++i) {
  rows.push({
    id: i,
  })
}

</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.appbox {
  width: 100%;
  height: 100%;
}

.table-box {
  width: 60%;
  height: 60%;
}
</style>
