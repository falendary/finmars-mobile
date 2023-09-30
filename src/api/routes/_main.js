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
	backendBalanceReportItems: {
		post: prefix + '/reports/backend-balance-report/items/',
	},
	backendBalanceReportGroups: {
		post: prefix + '/reports/backend-balance-report/groups/',
	},
	pnlReport: {
		post: prefix + '/reports/pl-report/',
	},
	transactionReport: {
		post: prefix + '/reports/transaction-report/',
	},
	backendTransactionReportItems: {
		post: prefix + '/reports/backend-transaction-report/items/',
	},
	transactionUserField: {
		get: prefix + '/ui/complex-transaction-user-field/primary/',
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
