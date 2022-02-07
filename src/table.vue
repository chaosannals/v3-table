<template>
    <div ref="rootElement" class="v3-table" :class="styleClasses">
        <v3-table-dock
            :columns="dockLeftColumns"
            :start="start"
            :rows="rows"
            :height="dockHeight"
            :head-height="headHeight"
            :row-height="rowHeight"
            :left="0"
        />
        <div
            ref="foreElement"
            class="v3-table-fore"
            :style="foreStyle"
            @dragover="onHeadCellDragOver"
            @drop="onHeadCellDrop"
            @mousewheel="onMouseWheel"
        >
            <table class="v3-table-main" :style="tableStyle">
                <tr ref="headElement" class="v3-table-head">
                    <th
                        class="v3-table-head-cell"
                        v-for="(column, i) in columns"
                        :key="i"
                        :style="headStyles[i]"
                    >
                        <v3-table-head-cell
                            :renderer="column.children?.head"
                            :content="column.props"
                        />
                        <div
                            class="v3-table-head-cell-drag"
                            draggable="true"
                            @dragstart="onHeadCellDragStart"
                            @dragend="onHeadCellDragEnd"
                        ></div>
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
            :columns="dockRightColumns"
            :start="start"
            :rows="rows"
            :height="dockHeight"
            :head-height="headHeight"
            :row-height="rowHeight"
            :right="dockRight"
        />
        <div ref="backElement" class="v3-table-back" :style="backStyle" @scroll="onVScroll">
            <div ref="fillElement" class="v3-table-fill" :style="fillStyle"></div>
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
} from "vue";
import { throttle } from "lodash";

const rootElement = ref();
const foreElement = ref();
const backElement = ref();
const headElement = ref();
const fillElement = ref();

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
const dragging = ref(false);
const sdw = ref(0);
const dockLeftWidth = ref(0);
const dockRightWidth = ref(0);
const dockRight = ref(0);
const dockHeight = ref(0);
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

const styleClasses = computed(() => {
    const result = [];
    if ($props.height == null) {
        result.push("filling");
    }
    return result;
});

const tableStyle = computed(() => {
    return {
        // width: `${tableWidth.value}px`
    };
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

const onHeadCellDragStart = e => {
    sdw.value = e.screenX;
    console.log('drag start', e);
    dragging.value = true;
};

const onHeadCellDrag = e => {
    console.log('drag', e);
};

const onHeadCellDragEnd = e => {
    const nsdw = e.screenX;
    console.log('drag end', nsdw - sdw.value + foreElement.value.scrollLeft);
    dragging.value = false;
};

const onHeadCellDragOver = e => {
    e.preventDefault();
    // console.log('drag over', e);
};

const onHeadCellDrop = e => {
    console.log('drop', e);
};

const onMouseWheel = e => {
    backElement.value.scrollBy(0, -e.wheelDelta);
}

const onResize = throttle(() => {
    const bcw = backElement.value.clientWidth;
    const bch = backElement.value.clientHeight;

    rowCount.value = Math.ceil(bch / $props.rowHeight);

    foreStyle.width = `${bcw}px`;
    backStyle.top = `${headElement.value.offsetHeight}px`;
    backStyle.bottom = `${foreElement.value.offsetHeight - foreElement.value.clientHeight
        }px`;
    fillStyle.height = `${$props.rowHeight * $props.rows.length}px`;
    console.log(backElement.value.offsetWidth, bcw);
    dockRight.value = backElement.value.offsetWidth - bcw;
    dockHeight.value = foreElement.value.clientHeight;
}, 100);

const onHeadResize = throttle(() => {
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
    border: 1px solid #f6f6f6;
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
    background: #f6f6f6f6;
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
    background: #2222;
}

.v3-table-head-cell {
    position: relative;
    box-sizing: border-box;
    padding: 3px 5px;
}

.v3-table-head-cell-drag {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 5px;
    height: 100%;
    cursor: ew-resize;
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