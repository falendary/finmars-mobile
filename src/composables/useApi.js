import routes from "@/api/routes";
import providers from "@/api/providers/main.js";
import { Preferences } from '@capacitor/preferences'

export default async function useApi (
		route_opt,
		{
			params,  // Router params
			body,    // Body for POST PUT PATCH
			filters, // Query object
			headers = {},
			provider = true // Query object
		} = {}
	) {

	let tokens = (await Preferences.get({key: 'kcTokens'})).value
	let token = JSON.parse(tokens).token

	const [route, method] = route_opt.split(".");
	let url = routes[route][method];

	if (!url) {
		console.log("Route not found:", route_opt);
		return false;
	}

	let baseApi = import.meta.env.VITE_WS
	if ( baseApi )
		url = url.replace('{client}', baseApi);

	let opts = {
		method: method.toUpperCase() || "GET",
		headers: {
			Authorization: "Token " + token,
			...headers
		}
	};

	if (body) opts.body = body;
	if (filters) {
		let searchPaarams = []

		for ( let prop in filters ) {
			searchPaarams.push(`${prop}=${filters[prop]}`)
		}

		url += '?' + searchPaarams.join('&')
	}
	if (params) {
		for (let param in params) {
			url = url.replace(`{${param}}`, params[param]);
		}
	}

	try {
		let response = await fetch(url, opts)
		response = await response.json()
		return method == 'get' && providers[route] && provider ? providers[route](response) : response

	} catch(e) {
		console.log('e:', e)
		let [code, url] = e.message.split('  ')

		let errors = {
			400: 'Wrong data',
			401: 'Not authorized',
		}

		let error_object = e.data?.error

		let text = error_object
		let title = code == 500 ? 'Server Error' : 'Client Error'

		useNotify({ group: 'server_error', title, text, duration: 20000 })

		return {error: e.data || true, code }
	}

}
