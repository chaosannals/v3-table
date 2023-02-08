# [v3-table](https://github.com/chenshenchao/v3-table)

一个 vue 3.0 的表格控件，DOM 只生成可见单元格元素，提高性能。

```bash
npm i v3-table
```

```js
import v3table from 'v3-table';
const app = createApp(App);
app.use(v3table);
app.mount('#app');
```

```html
<v3-table :rows="rows">
    <v3-table-column>
        <template v-slot:head>
            <span>第 1 列</span>
            <input />
        </template>
        <template v-slot="{ row, index }">
            <button>第 {{ index }} 行</button>
        </template>
    </v3-table-column>
    <v3-table-column title="第 2 列"/>
</v3-table>
```

```js
import { reactive } from "@vue/reactivity";

const rows = reactive([]);

for (let i = 0; i < 1000; ++i) {
  rows.push({
    id: i,
  })
}
```