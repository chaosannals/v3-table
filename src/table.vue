<template>
    <div
        ref="rootElement"
        class="v3-table"
        :class="styleClasses"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
        @mousemove="onMouseMove"
    >
        <v3-table-dock
            rewidth="right"
            :columns="dockLeftColumns"
            :start="start"
            :rows="rows"
            :height="dock.height"
            :head-height="headHeight"
            :row-height="rowHeight"
            :left="0"
            @mousewheel="onMouseWheel"
        />
        <div ref="foreElement" class="v3-table-fore" :style="foreStyle" @mousewheel="onMouseWheel">
            <table class="v3-table-main">
                <tr ref="headElement" class="v3-table-head">
                    <th
                        :ref="h => headElements.add(h)"
                        class="v3-table-head-cell"
                        v-for="(column, i) in columns"
                        :key="i"
                        :style="headStyles[i]"
                    >
                        <v3-table-head-cell
                            :renderer="column.children?.head"
                            :content="column.props"
                        />
                        <div :data-column="`${column.no}`" class="v3-table-head-cell-drag right"></div>
                    </th>
                </tr>
                <tr class="v3-table-row" v-for="(row, i) in rows" :key="i" :style="rowStyle">
                    <td class="v3-table-row-cell" v-for="(column, j) in columns" :key="j">
                        <v3-table-row-cell
                            :renderer="column.children?.default"
                            :content="{ row: row, index: start + i }"
                        />
                    </td>
                </tr>
            </table>
        </div>
        <v3-table-dock
            rewidth="left"
            :columns="dockRightColumns"
            :start="start"
            :rows="rows"
            :height="dock.height"
            :head-height="headHeight"
            :row-height="rowHeight"
            :right="dock.right"
            @mousewheel="onMouseWheel"
        />
        <div ref="backElement" class="v3-table-back" :style="backStyle" @scroll="onVScroll">
            <div ref="fillElement" class="v3-table-fill" :style="fillStyle"></div>
        </div>
        <div v-if="drag.dragging" class="v3-table-drag-pane">
            <div class="v3-table-drag-line" :style="lineStyle"></div>
        </div>
        <slot></slot>
    </div>
</template>

<script setup>
import { V3TableRowCell, V3TableHeadCell } from "./cell.js";
import V3TableDock from './dock.vue';
import {
    onMounted,
    useSlots,
    ref,
    onBeforeUnmount,
    computed,
    reactive,
    nextTick,
} from "vue";
import { throttle } from "lodash";

const rootElement = ref(); // 控件根元素引用
const foreElement = ref(); // 前面板（主表格）
const backElement = ref(); // 后面板（撑开滚轮）
const headElement = ref(); // 表头（前面板表头）
const headElements = reactive(new Set()); // 表头元素集合
const fillElement = ref(); // 支撑（后面板撑起）

const $props = defineProps({
    rows: {
        type: Array,
        required: true,
        default: () => [],
    },
    height: {
        type: [Number, null],
        required: false,
        default: null,
    },
    rowHeight: {
        type: Number,
        required: false,
        default: 30,
    },
    columnResizable: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const $emit = defineEmits({
    scroll: null,
});

const $slots = useSlots();
const start = ref(0);
const rowCount = ref(0);
const drag = reactive({
    dragging: false,
    offset: 0,
    column: null,
    signed: 1,
});
const dock = reactive({
    right: 0,
    height: 0,
});
const headHeight = ref(0);
const columnWidths = reactive([]);

const columns = computed(() => {
    if (!('default' in $slots)) {
        return [];
    }
    const result = $slots.default();
    result.sort((a, b) => {
        const ad = a.props.dock === 'left' ? -1 : a.props.dock === 'right' ? 1 : 0;
        const bd = b.props.dock === 'left' ? -1 : b.props.dock === 'right' ? 1 : 0;
        return ad < bd ? -1 : ad === bd ? 0 : 1;
    });
    for (let i in result) {
        result[i].width = columnWidths[i] ?? 100;
        result[i].no = i;
    }
    return result;
});

const dockLeftColumns = computed(() => {
    return columns.value.filter(c => {
        return c.props.dock == 'left';
    });
});
const dockRightColumns = computed(() => {
    return columns.value.filter(c => {
        return c.props.dock == 'right';
    });
});

// 计算显示的行
const rows = computed(() => {
    return $props.rows.slice(
        start.value,
        start.value + rowCount.value
    );
});

// 初始化列宽。
for (let column of columns.value) {
    columnWidths.push(column.props.width ?? 100);
}

const backStyle = reactive({
    top: 0,
});
const foreStyle = reactive({
    width: "auto",
});

const fillStyle = reactive({
    height: "100%",
});
const rowStyle = reactive({
    height: `${$props.rowHeight}px`,
});

const lineStyle = reactive({});

const styleClasses = computed(() => {
    const result = [];
    if ($props.height == null) {
        result.push("filling");
    }
    return result;
});

const headStyles = computed(() => {
    const result = [];
    for (let i in columns.value) {
        const style = {};
        style.width = `${columnWidths[i]}px`;
        style.minWidth = style.width;
        result.push(style);
    }
    return result;
});

const onMouseWheel = e => {
    backElement.value.scrollBy(0, -e.wheelDelta);
}

const onMouseDown = (e) => {
    const cl = e.target.classList;
    if (cl.contains('v3-table-head-cell-drag')) {
        lineStyle.left = `${e.clientX}px`;
        drag.dragging = true;
        drag.offset = e.clientX;
        drag.column = Number(e.target.dataset.column);
        drag.signed = cl.contains('left') ? -1 : 1;
        console.log('down', drag, e);
    }
}

const onMouseMove = (e) => {
    if (!drag.dragging) return;
    lineStyle.left = `${e.offsetX}px`;
    // console.log('move', e);
}

const endDrag = (e) => {
    if (!drag.dragging) return;
    drag.dragging = false;
    const offset = e.clientX - drag.offset;
    const i = drag.column;
    document.getSelection().removeAllRanges();
    columnWidths[i] = Math.max(20, columnWidths[i] + offset * drag.signed);
    // console.log('end drag', columnWidths[i], e.clientX, offset, drag);
    nextTick(() => getColumnsWidth());
}

const onMouseUp = (e) => {
    endDrag(e);
    console.log('up', e);
}

const onMouseLeave = (e) => {
    endDrag(e);
    console.log('leave', e);
}

// 得到当前表头元素集合的宽度
const getColumnsWidth = throttle(() => {
    Array.from(headElements).forEach((h, i) => columnWidths[i] = h.offsetWidth);
}, 100);

// 表格大小变化事件处理
const onResize = throttle(() => {
    const bcw = backElement.value.clientWidth;
    const bch = backElement.value.clientHeight;

    rowCount.value = Math.ceil(bch / $props.rowHeight);

    foreStyle.width = `${bcw}px`;
    backStyle.top = `${headElement.value.offsetHeight}px`;
    backStyle.bottom = `${foreElement.value.offsetHeight - foreElement.value.clientHeight
        }px`;
    fillStyle.height = `${$props.rowHeight * $props.rows.length}px`;
    // console.log(backElement.value.offsetWidth, bcw);
    dock.right = backElement.value.offsetWidth - bcw;
    dock.height = foreElement.value.clientHeight;
    getColumnsWidth();
}, 100);

const onHeadResize = throttle(() => {
    // TODO 考察 是否移动到 resize
    headHeight.value = headElement.value.offsetHeight;
}, 100);

const onVScroll = throttle((e) => {
    const bst = backElement.value.scrollTop;
    const bse = fillElement.value.offsetHeight - $props.rowHeight * 2;
    start.value = Math.floor((bst / bse) * $props.rows.length);
    $emit('scroll', e);
}, 100);

const observer = new ResizeObserver(onResize);
const headObserver = new ResizeObserver(onHeadResize);

onMounted(() => {
    onResize();
    observer.observe(rootElement.value);
    onHeadResize();
    headObserver.observe(headElement.value);
});

onBeforeUnmount(() => {
    observer.disconnect();
});
</script>

<style lang="scss" scoped>
.v3-table {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    background: #fff;

    &.filling {
        width: 100%;
        height: 100%;
    }
}

.v3-table-fore {
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    width: 100%;
    background: #fff;
}

.v3-table-drag-pane {
    display: block;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: #2221;
}

.v3-table-drag-line {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    height: 100%;
    border-left: 1px dotted #222d;
}

.v3-table-head {
    box-shadow: 0 3px 6px -2px #2222;
}

.v3-table-head-cell {
    position: relative;
    box-sizing: border-box;
    padding: 3px 5px;
}

.v3-table-head-cell-drag {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 5px;
    height: 100%;

    &.left {
        left: 0;
        cursor: e-resize;

        // &:hover {
        //     background: #39fd;
        // }
    }
    &.right {
        right: 0;
        cursor: w-resize;

        // &:hover {
        //     background: #f93d;
        // }
    }
}

.v3-table-back {
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    width: 100%;
    background: transparent;
}
</style>