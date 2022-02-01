import {
    createApp
} from 'vue'
import App from './app.vue'
import V3Button from './v3-button.vue';
import v3table from '../src/all.js';

const app = createApp(App);
app.component('v3-button', V3Button);
app.use(v3table);
app.mount('#app');