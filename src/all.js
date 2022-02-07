import V3Table from './table.vue';
import V3TableColumn from './column.js';

export * from './table.vue';
export * from './column.js';

export default {
    install(app) {
        app.component('v3-table', V3Table);
        app.component('v3-table-column', V3TableColumn);
    },
};