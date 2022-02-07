# [v3-table](https://github.com/chenshenchao/v3-table)

一个 vue 3.0 的表格控件，DOM 只生成可见单元格元素，提高性能。

```html
<v3-table>
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
