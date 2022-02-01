import {
    h
} from "vue";

/**
 * 
 * @param {*} props 
 * @param {*} context 
 * @returns 
 */
export const V3TableRowCell = (props, context) => {
    if (props.renderer) {
        return h(props.renderer, props.content);
    }
    return null;
};

V3TableRowCell.props = {
    renderer: {
        type: [Function, null],
        required: true,
        default: null,
    },
    content: {
        type: [Object, Array, null],
        required: true,
        default: null,
    },
};

/**
 * 
 * @param {*} props 
 * @param {*} context 
 */
export const V3TableHeadCell = (props, context) => {
    if (props.renderer) {
        return h(props.renderer, props.content);
    } else if (props.content?.title) {
        return h('div', props.content.title);
    }
    return null;
};

V3TableHeadCell.props = {
    renderer: {
        type: [Function, null],
        required: true,
        default: null,
    },
    content: {
        type: [Object, Array, null],
        required: true,
        default: null,
    },
};