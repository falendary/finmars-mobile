let prefix = '{host}/{client}/api/v1'

export default {
	portfolioLight: {
		get: prefix + '/portfolios/portfolio/light/',
	},
	reportsSummary: {
		get: prefix + '/reports/summary/',
	},
	reportsSummaryPortfolios: {
		get: prefix + '/reports/summary/portfolios/?portfolios={id}',
	},
	complexTransaction: {
		get: prefix + '/transactions/complex-transaction/light/',
	},
	balanceReport: {
		post: prefix + '/reports/balance-report/',
	},
	transactionReport: {
		post: prefix + '/reports/transaction-report/',
	},
	transactionUserField: {
		get: prefix + '/ui/complex-transaction-user-field/',
	},

	// Надо отделить
	reportsSummary: {
		get: prefix + '/reports/summary/',
	},
	widgetsHistory: {
		get: prefix + '/widgets/history/{type}/',
	},
	widgetsStats: {
		get: prefix + '/widgets/stats/',
	},
}
