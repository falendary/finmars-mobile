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
			portfolioListStock: [],
			currencyList: [],
			settings: {
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
					period: 'inception',
					date_to,
					date_from,
					currency,
					pricing_policy: '-',
					portfolios: [],
				}
			}

			await this.fetchFields()

			watch(this.settings, (newVal) => {
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
