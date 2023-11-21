import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue, IonPage, IonContent } from '@ionic/vue'
import log from '@/utils/log'

window.log = log
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

import '@/assets/main.scss'

import NumberFormat from '@/plugins/NumberFormat.js'
import { createPinia } from 'pinia'
import Particles from "vue3-particles";
import * as Sentry from "@sentry/vue";
import {
	ArcElement, BarElement, CategoryScale,
	Chart as ChartJS,
	DoughnutController, Filler, Legend, LinearScale,
	LineController,
	LineElement, LogarithmicScale,
	PieController,
	PointElement, Title, Tooltip
} from 'chart.js'
import RoundToTwo from '@/plugins/RoundToTwo.js'
import CopyToClipboard from '@/plugins/CopyToClipboard.js'

let pinia, app


createAppVue()

window.restartVueApp = () => {
	app.unmount()
	createAppVue()
}

function createAppVue() {
	pinia = createPinia()
	app = createApp(App)

	Sentry.init({
		app,
		dsn: "https://9ac2652235044ecb84403bb1511a6e2b@sentry.finmars.com/7",
	});

	app.use(router).use(IonicVue).use(NumberFormat).use(RoundToTwo).use(CopyToClipboard).use(pinia).use(Particles);

	app.component('IonPage', IonPage).component('IonContent', IonContent)

	app.config.errorHandler = (err, ) => {
		console.error('Caught a global error', err);
		// You can navigate the user to a recovery page or log them out here
		router.replace('/recovery');
	};

	app.mount('#app')
}

ChartJS.register(
	LineElement,
	PointElement,
	ArcElement,
	DoughnutController,
	LineController,
	PieController,
	CategoryScale,
	LinearScale,
	Filler,
	Legend,
	Tooltip,
	BarElement, Title,
	LogarithmicScale
)

// router.isReady().then(() => {})
