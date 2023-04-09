let host = import.meta.env.VITE_API_HOST
let prefix = host + '/{client}/api/v1'

export default {
	portfolioLight: {
		get: prefix + '/portfolios/portfolio-light/',
	},
	complexTransaction: {
		get: prefix + '/transactions/complex-transaction-light/',
	},
	
	// Надо отделить

	widgetsHistory: {
		get: prefix + '/widgets/history/{type}/'
	},
	widgetsStats: {
		get: prefix + '/widgets/stats/'
	}
}
