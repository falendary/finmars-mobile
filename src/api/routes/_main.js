let prefix = '{host}/{client}/api/v1'

export default {
	portfolioLight: {
		get: prefix + '/portfolios/portfolio/light/',
	},
	currencyLight: {
		get: prefix + '/currencies/currency/light/',
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
	pnlReport: {
		post: prefix + '/reports/pl-report/',
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
	reportsSummaryPortfolios: {
		get: prefix + '/reports/summary/portfolios/',
	},
	widgetsHistory: {
		get: prefix + '/widgets/history/{type}/',
	},
	widgetsStats: {
		get: prefix + '/widgets/stats/',
	},
	mobileLayout: {
		get: prefix + '/ui/mobile-layout/',
	},
	pricingPolicies: {
		get: prefix + '/instruments/pricing-policy/',
	},
}
