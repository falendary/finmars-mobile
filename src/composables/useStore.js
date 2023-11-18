import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import useApi from '@/composables/useApi.js'
import { watch } from 'vue'

export default defineStore('store', {
	state: () => {
		return {
			member: null,
			activeSpaceCode: null,
			globalProcessing: false,
			spaces: {}
		}
	},
	getters: {
		activeSpaceStore(state) {
			return state.spaces[state.activeSpaceCode]
		}
	},
	actions: {
		async fetchPortfolios() {
			let res = await useApi('portfolioLight.get', {
				filters: {
					page_size: '1000'
				}
			})

			this.spaces[this.activeSpaceCode].portfolios = res.results;

			if (res && !res.error) {

				if (!this.spaces[this.activeSpaceCode].settings.general.portfolios.length) {
					res.results.forEach((item) => {

						if (this.spaces[this.activeSpaceCode].settings.general.portfolios.length < 5) {
							if (item.first_transaction.date) {
								this.spaces[this.activeSpaceCode].settings.general.portfolios.push(item.user_code);
							}
						}

					})
				}

			} else {
				this.spaces[this.activeSpaceCode].portfolios = []
			}

		},
		async fetchCurrencies() {
			let res = await useApi('currencyLight.get')

			if (res && !res.error) {
				this.spaces[this.activeSpaceCode].currencies = res.results
			} else {
				this.spaces[this.activeSpaceCode].currencies = []
			}

		},

		async fetchPolicies() {
			let res = await useApi('pricingPolicies.get')

			if (res && !res.error) {
				this.spaces[this.activeSpaceCode].pricingPolicies = res.results

				if (!this.spaces[this.activeSpaceCode].settings.general.pricing_policy) {
					this.spaces[this.activeSpaceCode].settings.general.pricing_policy = res.results[0].user_code
				}

			} else {
				this.spaces[this.activeSpaceCode].pricingPolicies = []
			}

		},
		async fetchUser() {
			let result = await useApi('user.get')
			this.username = result.first_name || result.username

			await Preferences.set({ key: 'username', value: this.username})
		},
		async initSpaceStore() {

			console.log('initSpaceStore')

			let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })
			let { value: activeSpaceName } = await Preferences.get({ key: 'activeSpaceName' })

			console.log('initSpaceStore.activeSpaceCode', activeSpaceCode)

			this.activeSpaceCode = activeSpaceCode
			this.activeSpaceName = activeSpaceName

			if (this.spaces[this.activeSpaceCode]) {
				// seems already inited, skip
				console.log("STORE: already exists", activeSpaceCode);
				return
			}

			console.log("STORE: Creating new space store", activeSpaceCode);

			let date_from = dayjs().add(-3, 'month').format('YYYY-MM-DD')
			let date_to = dayjs().add(-1, 'day').format('YYYY-MM-DD')
			let currency = 'USD' // TODO consider to take default from backend

			this.spaces[this.activeSpaceCode] = {
				portfolios: [],
				currencies: [],
				pricingPolicies: [],
				settings: {
					general: {
						period: 'inception',
						date_to,
						date_from,
						currency,
						pricing_policy: null, // should be picked first from pricingPolicies list if not selected
						portfolios: []
					},
					balance: {
						isChartView: true,
						groupByKey: 'instrument.instrument_type.name',
						sumByKey: 'market_value',
						consolidateAccounts: true
					},
					pl: {
						isChartView: false,
						groupByKey: 'instrument.instrument_type.name',
						sumByKey: 'total',
						consolidateAccounts: true
					}
				},
			}

			await this.fetchCurrencies()
			await this.fetchPortfolios()
			await this.fetchPolicies()
			await this.fetchUser()


			let { value } = await Preferences.get({ key: this.activeSpaceCode + '_settings' })

			if (value) {

				console.log("STORE: found settings in device storage. Applying...")

				let settingsFromDevice = JSON.parse(value)

				for (let prop in settingsFromDevice) {
					this.spaces[this.activeSpaceCode].settings[prop] = settingsFromDevice[prop]
				}

			}

			watch(this.spaces[this.activeSpaceCode].settings, (newVal) => {

				console.log("STORE: settings changed")

				Preferences.set({ key: this.activeSpaceCode + '_settings', value: JSON.stringify(newVal) })
			})



		},
		async clear() {
			this.spaces = {}
			this.activeSpaceCode = null
			this.activeSpaceName = null
			this.member = null
			this.globalProcessing = false
		}
	}
})
