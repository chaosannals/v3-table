const V3TableColumn = (props, context) => {};

V3TableColumn.props = {
    title: {
        type: [String, null],
        required: false,
        default: null,
    },
    width: {
        type: [Number, null],
        required: false,
        default: null,
    },
    dock: {
        type: [String, null],
        required: false,
        default: null,
    },
    resizable: {
        type: [String, null],
        required: false,
        default: null,
    }
};

export default V3TableColumn;