import routes from '@/api/routes'
import providers from '@/api/providers/main.js'
import { Preferences } from '@capacitor/preferences'


import axios from 'axios'
import { clearTokens, refreshToken } from '@/services/keycloakService.js'
import useStore from '@/composables/useStore.js'

import router from '../router/index.js'

axios.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		if (error.response.status === 401) {
			let config = error.response.config

			// If retry count is not set, set it to 0
			if (!config.retryCount) {
				config.retryCount = 0
			}
			// Increment the retry count
			config.retryCount += 1

			// Check if we've retried more than 5 times
			if (config.retryCount > 5) {
				// Clear tokens or any other cleanup here
				await clearTokens()

				// Redirect to login
				router.push('/login')

				const store = useStore()

				store.setGlobalError(error)

				return Promise.reject(error)
			}

			// Handle token refresh logic here
			// After refreshing, you might want to retry the original request:

			// Update the token in the header
			const newToken = await refreshToken()
			config.headers['Authorization'] = 'Token ' + newToken

			return axios.request(config)
		}

		return Promise.reject(error)
	}
)

export default async function useApi(
	route_opt,
	{
		params, // Router params
		body, // Body for POST PUT PATCH
		filters, // Query object
		urlSearchParams,
		headers = {},
		provider = true, // Query object,
		signal: externalSignal, // NEW: Accepting a signal for aborting the request
		timeout = 60 * 1000 // NEW: Default timeout of 30 second
	} = {}
) {
	let loggerName = 'API - ' + Date.now()
	log.time(loggerName)

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
	const { value: workspace } = await Preferences.get({ key: 'activeSpaceCode' })
	let { value: region } = await Preferences.get({ key: 'region' })

	// if no region or workspace
	region = JSON.parse(region)

	if (!tokens) return false // error

	let token = JSON.parse(tokens).token

	const [route, method] = route_opt.split('.')
	let url = routes[route][method]

	if (!url) {
		// console.log('Route not found:', route_opt)
		return false
	}

	if (window.location.href.indexOf('0.0.0.0') !== -1) {

		if (url.indexOf('authorizer') !== -1) {
			url = url.replace('{host}', 'http://0.0.0.0:8083')
		} else {

			url = url.replace('{client}', 'space00000')
			url = url.replace('{host}', 'http://0.0.0.0:8000')
		}
	} else {
		url = url.replace('{client}', workspace)
		url = url.replace('{host}', region.domain)
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);


	const signal = externalSignal || controller.signal;

	let opts = {
		method: method.toUpperCase() || 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Token ' + token,
			...headers
		},
		signal: signal
	}

	if (body) opts.data = JSON.stringify(body)
	if (filters) {
		let searchPaarams = []

		for (let prop in filters) {
			searchPaarams.push(`${prop}=${filters[prop]}`)
		}

		url += '?' + searchPaarams.join('&')
	}
	if (urlSearchParams) {
		url += `?${urlSearchParams.toString()}`
	}

	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param])
		}
	}

	try {
		let response = await axios(url, opts)
		clearTimeout(timeoutId);
		response = await response.data
		log.timeEnd({
			key: loggerName,
			text: route_opt,
			place: 'api'
		})

		let result =
			method == 'get' && providers[route] && provider
				? providers[route](response)
				: response
		return result
	} catch (e) {
		clearTimeout(timeoutId);
		if (axios.isCancel(e)) {
			// console.log('Request was cancelled due to timeout');
			return { error: true, code: 'TIMEOUT' }; // Handle timeout specifically
		}

		// console.log('e:', e)
		let [code, url] = e.message.split('  ')

		let errors = {
			400: 'Wrong data',
			401: 'Not authorized'
		}

		let error_object = e.data?.error

		let text = error_object
		let title = code == 500 ? 'Server Error' : 'Client Error'

		log.timeEnd({
			key: loggerName,
			module: 'api'
		})
		// useNotify({ group: 'server_error', title, text, duration: 20000 })

		return { error: e.data || true, code }
	}
}
