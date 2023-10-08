let prefix = '{host}/{client}/api/v1'

export default {
	portfolioLight: {
		get: prefix + '/portfolios/portfolio/light/'
	},
	currencyLight: {
		get: prefix + '/currencies/currency/light/'
	},
	reportsSummary: {
		get: prefix + '/reports/summary/'
	},
	reportsSummaryPortfolios: {
		get: prefix + '/reports/summary/portfolios/?portfolios={id}'
	},
	complexTransaction: {
		get: prefix + '/transactions/complex-transaction/light/'
	},
	complexTransactionItem: {
		get: prefix + '/transactions/complex-transaction/{id}/'
	},
	instrument: {
		get: prefix + '/instruments/instrument/{id}/'
	},
	instrumentAttributes: {
		get: prefix + '/instruments/instrument/attributes/'
	},
	balanceReportAttributes: {
		get: prefix + '/reports/balance-report/attributes/'
	},
	performanceReport: {
		post: prefix + '/reports/performance-report/'
	},
	balanceReport: {
		post: prefix + '/reports/balance-report/'
	},
	backendBalanceReportItems: {
		post: prefix + '/reports/backend-balance-report/items/'
	},
	backendBalanceReportGroups: {
		post: prefix + '/reports/backend-balance-report/groups/'
	},
	pnlReport: {
		post: prefix + '/reports/pl-report/'
	},
	plReportAttributes: {
		get: prefix + '/reports/pl-report/attributes/'
	},
	backendPLReportItems: {
		post: prefix + '/reports/backend-pl-report/items/'
	},
	backendPLReportGroups: {
		post: prefix + '/reports/backend-pl-report/groups/'
	},
	transactionReport: {
		post: prefix + '/reports/transaction-report/'
	},
	backendTransactionReportItems: {
		post: prefix + '/reports/backend-transaction-report/items/'
	},
	transactionUserField: {
		get: prefix + '/ui/complex-transaction-user-field/primary/'
	},

	// Надо отделить
	reportsSummary: {
		get: prefix + '/reports/summary/'
	},
	reportsSummaryPortfolios: {
		get: prefix + '/reports/summary/portfolios/'
	},
	widgetsHistory: {
		get: prefix + '/widgets/history/{type}/'
	},
	widgetsStats: {
		get: prefix + '/widgets/stats/'
	},
	mobileLayout: {
		get: prefix + '/ui/mobile-layout/'
	},
	pricingPolicies: {
		get: prefix + '/instruments/pricing-policy/'
	}
}
