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
		integrations: [
			new Sentry.BrowserTracing({
				// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
				tracePropagationTargets: ["localhost", /^https:\/\/finmars\.com\//],
				routingInstrumentation: Sentry.vueRouterInstrumentation(router),
			}),
			new Sentry.Replay(),
		],
		// Performance Monitoring
		tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
		// Session Replay
		replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
		replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	});

	app.use(router).use(IonicVue).use(NumberFormat).use(pinia).use(Particles);

	app.component('IonPage', IonPage).component('IonContent', IonContent)

	app.mount('#app')
}

// router.isReady().then(() => {})
