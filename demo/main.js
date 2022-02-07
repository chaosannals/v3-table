import {
    createApp
} from 'vue';
import 'v3-widgets/dist/style.css';
import v3widgets from 'v3-widgets';
import App from './app.vue'
import v3table from '../src/all.js';

const app = createApp(App);
app.use(v3widgets);
app.use(v3table);
app.mount('#app');