<template>
    <div class="v3-table-dock" :style="rootStyles" @mousewheel="onMouseWheel">
        <table>
            <tr ref="headElement" class="v3-table-head">
                <th
                    class="v3-table-head-cell"
                    v-for="(column, i) in columns"
                    :key="i"
                    :style="headStyles[i]"
                >
                    <v3-table-head-cell :renderer="column.children?.head" :content="column.props" />
                    <div
                        class="v3-table-head-cell-drag"
                        draggable="true"
                    ></div>
                </th>
            </tr>
            <tr class="v3-table-row" v-for="(row, i) in rows" :key="i" :style="rowStyle">
                <td class="v3-table-row-cell" v-for="(column, j) in columns" :key="j">
                    <v3-table-row-cell
                        :renderer="column.children?.default"
                        :content="{ row: row, index: $props.start + i }"
                    />
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup>
import lodash from 'lodash';
import { computed, reactive, ref } from "vue";
import { V3TableRowCell, V3TableHeadCell } from "./cell.js";

const $emit = defineEmits({
    mousewheel: null,
});

const $props = defineProps({
    start: {
        type: Number,
        required: true,
        default: 0,
    },
    top: {
        type: [Number, null],
        required: false,
        default: 0,
    },
    left: {
        type: [Number, null],
        required: false,
        default: null,
    },
    right: {
        type: [Number, null],
        required: false,
        default: null,
    },
    width: {
        type: [Number, null],
        required: false,
        default: null,
    },
    height: {
        type: [Number, null],
        required: false,
        default: null,
    },
    headHeight: {
        type: Number,
        required: true,
        default: 0,
    },
    columns: {
        type: Array,
        required: true,
        default: () => [],
    },
    rows: {
        type: Array,
        required: true,
        default: () => [],
    },
    rowHeight: {
        type: Number,
        required: false,
        default: 30,
    },
});

const sdw = ref(0);

const rootStyles = computed(() => {
    const result = {};
    if (lodash.isNumber($props.top)) {
        result['top'] = `${$props.top}${$props.top != 0 ? 'px' : ''}`;
    }
    if (lodash.isNumber($props.left)) {
        result['left'] = `${$props.left}${$props.left != 0 ? 'px' : ''}`;
    }
    if (lodash.isNumber($props.right)) {
        result['right'] = `${$props.right}${$props.right != 0 ? 'px' : ''}`;
    }
    if (lodash.isNumber($props.width)) {
        result['width'] = `${$props.width}${$props.width != 0 ? 'px' : ''}`;
    }
    if (lodash.isNumber($props.height)) {
        result['height'] = `${$props.height}${$props.height != 0 ? 'px' : ''}`;
    }
    return result;
});

const headStyles = computed(() => {
    const result = [];
    for (let v of $props.columns) {
        const style = {};
        style.width = `${v.width}px`;
        style.height = `${$props.headHeight}px`;
        result.push(style);
    }
    return result;
});

const rowStyle = reactive({
    height: `${$props.rowHeight}px`,
});

const onMouseWheel = e => {
    $emit('mousewheel', e);
};

</script>

<style lang="scss" scoped>
.v3-table-dock {
    overflow: hidden;
    position: absolute;
    z-index: 100;
    background: #f6f6f6f6;
    box-shadow: 0 -2px 2px 2px #2222;
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
</style>