import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import { watch } from 'vue'

export default defineStore('store', {
	state: () => {
		return {
			member: null,
			workspace: null,
			portfolioList: [],
			currencyList: [],
			settings: {
				dashboard: null,
				balance: null,
				pnl: null,
				transactions: {
					date_from: '2022-09-09',
					date_to: '2022-09-09',
					portfolios: ['-', 'Model'],
				},
			},
		}
	},

	actions: {
		async init() {
			let { value } = await Preferences.get({ key: 'layout' })

			if (value) {
				let layout = JSON.parse(value)

				for (let prop in layout) {
					this.settings[prop] = layout[prop]
				}
			} else {
				let date_from = dayjs().add(-3, 'month').format('YYYY-MM-DD')
				let date_to = dayjs().add(-1, 'day').format('YYYY-MM-DD')
				let currency = 'USD'

				this.settings.dashboard = {
					date: date_to,
					currency,
					portfolios: [],
				}
				this.settings.balance = {
					date: date_to,
					currency,
				}
				this.settings.pnl = {
					date_from,
					date_to,
					currency,
				}
				this.settings.transactions = {
					date_from,
					date_to,
					portfolios: [],
				}
			}

			watch(this.settings, (newVal) => {
				console.log('newVal:', newVal)
				Preferences.set({ key: 'layout', value: JSON.stringify(newVal) })
			})
		},
	},
})
