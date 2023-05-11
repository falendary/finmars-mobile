import { onMounted, ref, reactive } from 'vue'

const store = reactive({
	member: null,
	workspace: null,
	portfolioList: [],
	currencyList: [],
	settings: {
		dashboard: {
			date: '2022-09-09',
			currency: 'USD',
			// portfolios: ['-', 'Model'],
		},
		balance: {
			date: '2022-09-09',
			currency: 'USD',
		},
		transactions: {
			date_from: '2022-09-09',
			date_to: '2022-09-09',
			portfolios: ['-', 'Model'],
		},
		pnl: {
			date_from: '2022-09-09',
			date_to: '2022-09-09',
			currency: 'USD',
		},
	},
})

export default () => {
	return store
}
