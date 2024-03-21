import { createRouter, createWebHistory } from '@ionic/vue-router'
import { Preferences } from '@capacitor/preferences'

import routes from './routes.js'
import '../keycloak.js'

let keycloak

const router = createRouter({
	history: createWebHistory(import.meta.env.VITE_BASE_URL),
	routes,
})

// router.beforeEach(async (to, from) => {
// 	// refactor
//
// 	const { value: space } = await Preferences.get({ key: 'space' })
//
// 	// console.log('to.path ', to.path );
//
// 	if (to.path == '/logout') {
// 		Preferences.clear()
//
// 		await window.keycloak.logout({
// 			redirectUri: window.location.origin + router.options.history.base + '/',
// 		})
//
// 		return false
// 	}
//
// })




export default router
