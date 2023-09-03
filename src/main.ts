import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import BetterSelect from './better-select.vue'
const app = createApp(App)
app.component('BetterSelect', BetterSelect)
app.mount('#app')
