import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import { watch } from 'vue'
import useApi from './useApi'

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
				transactions: null,
				general: null,
			},
			layout: null,
		}
	},

	actions: {
		async init() {
			let { value } = await Preferences.get({ key: 'layout' })
			// value = null
			if (value) {
				let layout = JSON.parse(value)

				for (let prop in layout) {
					this.settings[prop] = layout[prop]
				}
			} else {
				let date_from = dayjs().add(-3, 'month').format('YYYY-MM-DD')
				let date_to = dayjs().add(-1, 'day').format('YYYY-MM-DD')
				let currency = 'USD'

				this.settings.general = {
					date_to,
					currency,
					pricing_policy: '-',
				}

				this.settings.balance = {}

				this.settings.dashboard = {
					date: date_to,
					portfolios: [],
				}
				this.settings.pnl = {
					date_from,
					pricing_policy: '',
				}
				this.settings.transactions = {
					date_from,
					portfolios: [],
				}
			}

			this.fetchFields()

			watch(this.settings, (newVal) => {
				console.log('newVal:', newVal)
				Preferences.set({ key: 'layout', value: JSON.stringify(newVal) })
			})
		},
		async fetchFields() {
			let res = await useApi('mobileLayout.get', {
				filters: { is_default: true },
			})

			if (res.results && res.results[0]) {
				this.layout = res.results[0].data
			} else {
				this.layout = {
					pnl: {
						fieldsToGroup: [
							{ name: 'Asset type', key: 'instrument.attributes.asset_types' },
							{ name: 'Sector', key: 'instrument.attributes.sector' },
							{ name: 'Currency', key: 'pricing_currency.short_name' },
						],
					},
					balance: {
						fieldsToGroup: [
							{ name: 'Asset type', key: 'instrument.attributes.asset_types' },
							{ name: 'Sector', key: 'instrument.attributes.sector' },
							{ name: 'Currency', key: 'pricing_currency.short_name' },
						],
					},
				}
			}
		},
	},
})
