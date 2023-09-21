import routes from '@/api/routes'
import providers from '@/api/providers/main.js'
import { Preferences } from '@capacitor/preferences'


import axios from 'axios';
import { refreshToken } from '@/services/keycloakService.js'
axios.interceptors.response.use(
	response => {
		return response;
	},
	async error => {
		if (error.response.status === 401) {
			// Handle token refresh logic here
			// For instance, call your function that refreshes Keycloak token

			// After refreshing, you might want to retry the original request:
			let config = error.response.config;

			// Update the token in the header
			const newToken = await refreshToken();
			config.headers['Authorization'] = 'Token ' + newToken;

			return axios.request(config);
		}

		return Promise.reject(error);
	}
);

export default async function useApi(
	route_opt,
	{
		params, // Router params
		body, // Body for POST PUT PATCH
		filters, // Query object
		headers = {},
		provider = true, // Query object
	} = {}
) {
	let loggerName = 'API - ' + Date.now()
	log.time(loggerName)

	let { value: tokens } = await Preferences.get({ key: 'kcTokens' })
	const { value: workspace } = await Preferences.get({ key: 'workspace' })
	let { value: region } = await Preferences.get({ key: 'region' })

	// if no region or workspace
	region = JSON.parse(region)

	if (!tokens) return false // error

	let token = JSON.parse(tokens).token

	const [route, method] = route_opt.split('.')
	let url = routes[route][method]

	if (!url) {
		console.log('Route not found:', route_opt)
		return false
	}

	url = url.replace('{client}', workspace)
	url = url.replace('{host}', region.domain)

	let opts = {
		method: method.toUpperCase() || 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Token ' + token,
			...headers,
		},
	}

	if (body) opts.data = JSON.stringify(body)
	if (filters) {
		let searchPaarams = []

		for (let prop in filters) {
			searchPaarams.push(`${prop}=${filters[prop]}`)
		}

		url += '?' + searchPaarams.join('&')
	}
	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param])
		}
	}

	try {
		let response = await axios(url, opts);
		response = await response.data;
		log.timeEnd({
			key: loggerName,
			text: route_opt,
			place: 'api',
		})

		let result =
			method == 'get' && providers[route] && provider
				? providers[route](response)
				: response
		return result
	} catch (e) {
		console.log('e:', e)
		let [code, url] = e.message.split('  ')

		let errors = {
			400: 'Wrong data',
			401: 'Not authorized',
		}

		let error_object = e.data?.error

		let text = error_object
		let title = code == 500 ? 'Server Error' : 'Client Error'

		log.timeEnd({
			key: loggerName,
			module: 'api',
		})
		// useNotify({ group: 'server_error', title, text, duration: 20000 })

		return { error: e.data || true, code }
	}
}
