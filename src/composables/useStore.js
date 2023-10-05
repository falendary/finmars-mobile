import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import { watch } from 'vue'
import useApi from './useApi'

export default defineStore('store', {
	state: () => {
		return {
			member: null,
			activeSpaceCode: null,
			spaces: {}
			// portfolioList: [],
			// portfolioListStock: [],
			// currencyList: [],
			// settings: {
			// 	general: null,
			// },
			// layout: null,
		}
	},

	actions: {
		async init() {
			let { value } = await Preferences.get({ key: 'layout' })
			let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })
			let { value: activeSpaceName } = await Preferences.get({ key: 'activeSpaceName' })

			this.activeSpaceCode = activeSpaceCode;
			this.activeSpaceName = activeSpaceName;

			if (!this.spaces[this.activeSpaceCode]) {
				this.spaces[this.activeSpaceCode] = {
					portfolioList: [],
					portfolioListStock: [],
					currencyList: [],
					settings: {
						general: {},
						balance: {
							isChartView: true,
							groupByKey: 'instrument.instrument_type.name',
							sumByKey: 'market_value',
							consolidateAccounts: true
						},
						pl: {
							isChartView: true,
							groupByKey: 'instrument.instrument_type.name',
							sumByKey: 'total',
							consolidateAccounts: true
						},
					},
					layout: null, // deprecated
				}
			}

			// value = null
			if (value) {
				let layout = JSON.parse(value)

				for (let prop in layout) {
					this.spaces[this.activeSpaceCode].settings[prop] = layout[prop]
				}
			} else {
				let date_from = dayjs().add(-3, 'month').format('YYYY-MM-DD')
				let date_to = dayjs().add(-1, 'day').format('YYYY-MM-DD')
				let currency = 'USD'

				this.spaces[this.activeSpaceCode].settings.general = {
					period: 'inception',
					date_to,
					date_from,
					currency,
					pricing_policy: null, // should be picked first from pricingPolicies list if not selected
					portfolios: [],
				}
			}

			await this.fetchFields()

			watch(this.spaces[this.activeSpaceCode].settings, (newVal) => {
				Preferences.set({ key: 'layout', value: JSON.stringify(newVal) })
			})
		},
		async fetchFields() {
			let res = await useApi('mobileLayout.get', {
				filters: { is_default: true },
			})

			if (res.results && res.results[0]) {
				this.spaces[this.activeSpaceCode].layout = res.results[0].data
			} else {
				this.spaces[this.activeSpaceCode].layout = {
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
