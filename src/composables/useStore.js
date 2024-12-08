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
			activeRealmCode: null,
			globalProcessing: false,
			activeSpace: null,
			activeSpaceStore: null,
			error: null
		}
	},
	getters: {},
	actions: {
		setPeriodType(periodType) {

			// console.log('store.setPeriodType', periodType)

			this.activeSpaceStore.settings.general.periodType = periodType
		},
		setGlobalError(error) {
			this.error = error
		},
		getActiveSpaceStore() {
			return this.activeSpaceStore
		},
		async fetchPortfolios() {
			let res = await useApi('portfolioLight.get', {
				filters: {
					page_size: '1000'
				}
			})

			this.activeSpaceStore.portfolios = res.results

		},
		async fetchAccounts() {
			let res = await useApi('accountLight.get', {
				filters: {
					page_size: '1000'
				}
			})

			this.activeSpaceStore.accounts = res.results

		},
		async fetchCurrencies() {
			let res = await useApi('currencyLight.get')

			if (res && !res.error) {
				this.activeSpaceStore.currencies = res.results
			} else {
				this.activeSpaceStore.currencies = []
			}

		},

		async fetchPolicies() {
			let res = await useApi('pricingPolicies.get')

			if (res && !res.error) {
				this.activeSpaceStore.pricingPolicies = res.results

				if (!this.activeSpaceStore.settings.general.pricing_policy) {
					this.activeSpaceStore.settings.general.pricing_policy = res.results[0].user_code
				}

			} else {
				this.activeSpaceStore.pricingPolicies = []
			}

		},
		async fetchUser() {
			let result = await useApi('user.get')
			this.username = result.first_name || result.username

			await Preferences.set({ key: 'username', value: this.username })
		},
		async initSpaceStore() {

			// console.log('STORE: initSpaceStore')

			let { value: activeSpaceCode } = await Preferences.get({ key: 'activeSpaceCode' })
			let { value: activeRealmCode } = await Preferences.get({ key: 'activeRealmCode' })
			let { value: activeSpaceName } = await Preferences.get({ key: 'activeSpaceName' })

			// console.log('STORE: initSpaceStore.activeSpaceCode', activeSpaceCode)

			this.activeRealmCode = activeRealmCode
			this.activeSpaceCode = activeSpaceCode
			this.activeSpaceName = activeSpaceName

			// TODO WTF
			// Some shitty code in that vue router, framework
			// seems that IndexComponent start by router before everything
			// then keycloak interrupt this, checks login, after it redirects back,
			// but because has been created .activeSpaceStore, but not finished (settings from device is not applied)
			// we can see a bug where or portfolios is []


			// if (this.activeSpaceStore) {
			// 	// seems already inited, skip
			// 	// console.log('STORE: already exists', activeSpaceCode)
			// 	return
			// }

			if (activeSpaceCode) {

				// console.log('STORE: Creating new space store', activeSpaceCode)

				let date_from = dayjs().add(-3, 'month').format('YYYY-MM-DD')
				let date_to = dayjs().add(-1, 'day').format('YYYY-MM-DD')
				let currency = 'USD' // TODO consider to take default from backend


				this.activeSpaceStore = {
					portfolios: [],
					currencies: [],
					pricingPolicies: [],
					settings: {
						general: {
							date_to,
							date_from,
							currency,
							pricing_policy: null, // should be picked first from pricingPolicies list if not selected
							portfolios: [],
							accounts: [],
							consolidateAccounts: false,
							allocationMode: false,
							period_type: 'ytd'
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
						},
						recipients: []
					},
					activeTab: 'All',
					searchQuery: '',
					searchType: '',
					searchResult: null

				}

				await this.fetchCurrencies()
				await this.fetchPortfolios()
				await this.fetchAccounts()
				await this.fetchPolicies()
				await this.fetchUser()


				let { value } = await Preferences.get({ key: this.activeSpaceCode + '_settings' })

				if (value) {

					// console.log('STORE: found settings in device storage. Applying...')

					let settingsFromDevice = JSON.parse(value)

					for (let prop in settingsFromDevice) {
						this.activeSpaceStore.settings[prop] = settingsFromDevice[prop]
					}

				}
				if (!this.activeSpaceStore.settings.general.period_type) {
					this.activeSpaceStore.settings.general.period_type = 'ytd'
				}

				console.log('this.activeSpaceStore', this.activeSpaceStore);

				if (!this.activeSpaceStore.settings.general.portfolios) {
					this.activeSpaceStore.settings.general.portfolios = []
				}

				if (!this.activeSpaceStore.settings.general.accounts) {
					this.activeSpaceStore.settings.general.accounts = []
				}

				if (!this.activeSpaceStore.settings.general.portfolios.length) {
					this.activeSpaceStore.portfolios.forEach((item) => {

						if (this.activeSpaceStore.settings.general.portfolios.length < 5) {
							if (item.first_transaction.date) {
								this.activeSpaceStore.settings.general.portfolios.push(item.user_code)
							}
						}

					})
				}

				watch(this.activeSpaceStore.settings, (newVal) => {

					// console.log('STORE: settings changed')

					Preferences.set({ key: this.activeSpaceCode + '_settings', value: JSON.stringify(newVal) })
				}, { deep: true })

				// console.log('STORE: initSpaceStore.done')

			}

		},
		async clear() {
			this.activeSpaceStore = null
			this.activeSpace = null
			this.activeRealmCode = null
			this.activeSpaceCode = null
			this.activeSpaceName = null
			this.member = null
			this.globalProcessing = false
		}
	}
})
