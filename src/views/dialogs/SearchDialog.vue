<template>
	<ion-modal ref="modal" :is-open="isOpen">
		<ion-header>
			<ion-toolbar>
				<ion-title>Explore</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="closeSearchDialog()">Close</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">

			<div class="search-dialog-wrap">

				<ion-searchbar id="searchBar" :value="query" :debounce="1000" show-cancel-button="never" @ionInput="handleSearch($event)"></ion-searchbar>

				<ion-icon class="clear-search-result-icon-button" slot="icon-only" :ios="icons.closeOutline" :md="close" @click="clearSearchResult($event)"></ion-icon>

				<div style="margin-top: 0.5rem; min-height: 50vh;" class="position-relative">

					<div v-if="!searchProcessing && query">

						<div v-if="balanceSearchResults.length">

							<h4>Results (Balance Report)</h4>

							<div v-for="(item, index) in balanceSearchResults" v-bind:key="index" @click="submitSearchResult($event, 'balance', item)"
									 class="search-result-item">

								<div class="search-result-item-card">

									<div class="search-result-item-card-header">
										{{ item.name }}
									</div>

									<div class="search-result-item-card-content">
										<ion-item>
											<ion-label>
												Market Value
											</ion-label>
											{{ $format(item.market_value) }}

										</ion-item>

										<ion-item v-if="item['portfolio.user_code'] && item['portfolio.user_code'] != '-'">
											<ion-label>
												Portfolio
											</ion-label>
											{{ item['portfolio.user_code'] }}

										</ion-item>

										<ion-item v-if="item['account.user_code'] && item['account.user_code'] != '-'">
											<ion-label>
												Account
											</ion-label>
											{{ item['account.user_code'] }}

										</ion-item>

									</div>
								</div>

							</div>

						</div>

						<div v-if="plSearchResults.length">

							<h4>Results (P&L Report)</h4>

							<div v-for="(item, index) in plSearchResults" v-bind:key="index" @click="submitSearchResult($event, 'pnl', item)"
									 class="search-result-item">

								<div class="search-result-item-card">

									<div class="search-result-item-card-header">
										{{ item.name }}
									</div>

									<div class="search-result-item-card-content">
										<ion-item>
											<ion-label>
												Total
											</ion-label>
											{{ $format(item.total) }}

										</ion-item>

										<ion-item v-if="item['portfolio.user_code'] && item['portfolio.user_code'] != '-'">
											<ion-label>
												Portfolio
											</ion-label>
											{{ item['portfolio.user_code'] }}

										</ion-item>

										<ion-item v-if="item['account.user_code'] && item['account.user_code'] != '-'">
											<ion-label>
												Account
											</ion-label>
											{{ item['account.user_code'] }}

										</ion-item>

										<ion-item v-if="item['item_group_name']">
											<ion-label>
												Type
											</ion-label>
											{{ item['item_group_name'] }}

										</ion-item>

									</div>
								</div>

							</div>

						</div>

						<div v-if="transactionsSearchResults.length">

							<h4>Results (Transactions)</h4>

							<div v-for="(item, index) in transactionsSearchResults" v-bind:key="index" @click="submitSearchResult($event, 'transaction', item)"
									 class="search-result-item">

								<div class="search-result-item-card">

									<div class="search-result-item-card-header">
										{{ item['complex_transaction.text'] }}
									</div>

									<div class="search-result-item-card-content">
										<ion-item>
											<ion-label>
												Accounting Date
											</ion-label>
											{{ item.accounting_date }}

										</ion-item>

										<ion-item v-if="item['portfolio.user_code'] && item['portfolio.user_code'] != '-'">
											<ion-label>
												Portfolio
											</ion-label>
											{{ item['portfolio.user_code'] }}

										</ion-item>

										<ion-item v-if="item['account.user_code'] && item['account.user_code'] != '-'">
											<ion-label>
												Account
											</ion-label>
											{{ item['account.user_code'] }}

										</ion-item>

										<ion-item v-if="item['complex_transaction.transaction_type.name'] && item['complex_transaction.transaction_type.name'] != '-'">
											<ion-label>
												Transaction Type
											</ion-label>
											{{ item['complex_transaction.transaction_type.name'] }}

										</ion-item>

										<ion-item v-if="item['complex_transaction.code']">
											<ion-label>
												Transaction Code
											</ion-label>
											{{ item['complex_transaction.code'] }}

										</ion-item>

									</div>
								</div>

							</div>

						</div>

					</div>

					<div v-if="!balanceSearchResults.length && !transactionsSearchResults.length && searchQuery && !searchProcessing" class="text-center">

						<ion-icon :icon="icons.telescopeOutline" size="large"></ion-icon>

						<h1>No Results Found</h1>
						<p>Try different search</p>

					</div>

					<div v-if="searchProcessing" class="loading-overlay">

						<div class="display-flex align-center justify-center height-100">
							<progress-circular diameter="90"></progress-circular>
						</div>

					</div>

					<div v-if="searchError" class="text-center">
						{{searchErrorMessage}}
					</div>

				</div>

			</div>

		</ion-content>
	</ion-modal>
</template>

<script>
	import { computed } from 'vue'
	import {
		IonButton,
		IonButtons,
		IonContent,
		IonHeader,
		IonIcon,
		IonItem,
		IonModal,
		IonSearchbar,
		IonTitle,
		IonToolbar
	} from '@ionic/vue'

	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { telescopeOutline } from 'ionicons/icons'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import errorService from '@/services/errorService.js'

	export default {
		components: {
			ProgressCircular,
			IonIcon,
			IonSearchbar,
			IonItem,
			IonContent,
			IonTitle,
			IonButton,
			IonButtons,
			IonHeader,
			IonToolbar,
			IonModal,
		},
		props: {
			position: Object, // Data to display in the modal
			isOpen: Boolean // Controls whether the modal is open or closed
		},
		data() {
			return {
				spaceStore: null,
				icons: {
					telescopeOutline
				},
				searchProcessing: false,
				balanceSearchResults: [],
				transactionsSearchResults: [],
				plSearchResults: [],
				searchQuery: null,
				searchError: false,
				searchErrorMessage: '',
				query: ''

			}
		},
		watch: {
			async isOpen(newVal) {
				if (newVal) {
					this.query = ''
					this.searchResults = []
					this.searchProcessing = false

				}

				setTimeout(async () => {
					document.querySelector('#searchBar input').focus()
				}, 200)
			}
		},
		emits: ['close', 'resultSelectCallback'],
		methods: {
			closeSearchDialog() {
				this.$emit('close')
			},
			async clearSearchResult() {

				this.query = '';

				this.spaceStore.searchQuery = '';
				this.spaceStore.searchType = '';
				this.spaceStore.searchResult = null;

			},

			async doBalanceSearch(query){
				try {
					// console.log('handleSearch', event)
					// console.log('reportType', this.reportType)

					let url = 'backendBalanceReportItems.post'

					// do PL later
					// if (this.reportType === 'pl') {
					// 	url = 'backendPLReportItems.post'
					// }

					// console.log('url', url);

					let res = await useApi(url, {
						body: {
							account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
							accounts: [],
							accounts_cash: [],
							accounts_position: [],
							allocation_detailing: true,
							allocation_mode: 0,
							approach_multiplier: 0.5,
							calculate_pl: true,
							calculationGroup: 'portfolio',
							complex_transaction_statuses_filter: 'booked',
							cost_method: 1,
							custom_fields_to_calculate: '',
							expression_iterations_count: 1,
							frontend_request_options: {
								columns: [],
								filter_settings: [],
								globalTableSearch: query,
								page: 1,
								groups_values: [],
								groups_types: []
							},
							pl_include_zero: false,
							portfolio_mode: 1,
							portfolios: this.spaceStore.settings.general.portfolios,
							pricing_policy: this.spaceStore.settings.general.pricing_policy,
							report_currency: this.spaceStore.settings.general.currency,
							report_date: this.spaceStore.settings.general.date_to,
							report_type: 1,
							show_balance_exposure_details: false,
							show_transaction_details: true,
							strategies1: [],
							strategies2: [],
							strategies3: [],
							strategy1_mode: 0,
							strategy2_mode: 0,
							strategy3_mode: 0
						}
					})

					this.balanceSearchResults = res.items

				} catch (error) {

					console.error('error', error)

					this.balanceSearchResults = []

					this.searchError = true;
					this.searchErrorMessage = errorService.getRandomErrorMessage()

				}

			},
			async doPLSearch(query){
				try {
					// console.log('handleSearch', event)
					// console.log('reportType', this.reportType)

					let url = 'backendPLReportItems.post'

					// console.log('url', url);

					let res = await useApi(url, {
						body: {
							account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
							accounts: [],
							accounts_cash: [],
							accounts_position: [],
							allocation_detailing: true,
							allocation_mode: 0,
							approach_multiplier: 0.5,
							calculate_pl: true,
							calculationGroup: 'portfolio',
							complex_transaction_statuses_filter: 'booked',
							cost_method: 1,
							custom_fields_to_calculate: '',
							expression_iterations_count: 1,
							frontend_request_options: {
								columns: [],
								filter_settings: [],
								globalTableSearch: query,
								page: 1,
								groups_values: [],
								groups_types: []
							},
							pl_include_zero: false,
							portfolio_mode: 1,
							portfolios: this.spaceStore.settings.general.portfolios,
							pricing_policy: this.spaceStore.settings.general.pricing_policy,
							report_currency: this.spaceStore.settings.general.currency,
							report_date: this.spaceStore.settings.general.date_to,
							report_type: 1,
							show_balance_exposure_details: false,
							show_transaction_details: true,
							strategies1: [],
							strategies2: [],
							strategies3: [],
							strategy1_mode: 0,
							strategy2_mode: 0,
							strategy3_mode: 0
						}
					})

					this.plSearchResults = res.items

					// this.balanceSearchResults = res.items.filter((item) =>{
					// 	return item.item_group === 10; // only opened positions
					// })

				} catch (error) {

					console.error('error', error)

					this.plSearchResults = []

					this.searchError = true;
					this.searchErrorMessage = errorService.getRandomErrorMessage()

				}

			},
			async doTransactionsSearch(query){
				try {
					// console.log('handleSearch', event)
					// console.log('reportType', this.reportType)

					let url = 'backendTransactionReportItems.post'

					// console.log('url', url);

					let res = await useApi(url, {
						body: {
							account_mode: this.spaceStore.settings.general.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
							accounts: [],
							accounts_cash: [],
							accounts_position: [],
							allocation_detailing: true,
							allocation_mode: 0,
							approach_multiplier: 0.5,
							calculate_pl: true,
							calculationGroup: 'portfolio',
							complex_transaction_statuses_filter: 'booked',
							cost_method: 1,
							custom_fields_to_calculate: '',
							expression_iterations_count: 1,
							frontend_request_options: {
								columns: [],
								filter_settings: [],
								globalTableSearch: query,
								page: 1,
								groups_values: [],
								groups_types: []
							},
							pl_include_zero: false,
							portfolio_mode: 1,
							portfolios: this.spaceStore.settings.general.portfolios,
							pricing_policy: this.spaceStore.settings.general.pricing_policy,
							report_currency: this.spaceStore.settings.general.currency,
							report_date: this.spaceStore.settings.general.date_to,
							report_type: 1,
							show_balance_exposure_details: false,
							show_transaction_details: true,
							strategies1: [],
							strategies2: [],
							strategies3: [],
							strategy1_mode: 0,
							strategy2_mode: 0,
							strategy3_mode: 0
						}
					})

					this.transactionsSearchResults = res.items

				} catch (error) {

					console.error('error', error)

					this.balanceSearchResults = []

					this.searchError = true;
					this.searchErrorMessage = errorService.getRandomErrorMessage()

				}

			},

			async doSearch(query) {

				this.searchError = false;

				this.searchProcessing = true

				await this.doBalanceSearch(query);
				await this.doPLSearch(query);
				await this.doTransactionsSearch(query);

				this.searchProcessing = false


			},
			async handleSearch(event) {

				this.query = event.target.value.toLowerCase()

				if (this.query.length) {
					await this.doSearch(this.query)
				}

			},

			async submitSearchResult(event, type,  item) {

				// console.log('SearchDialog.submitSearchResult.item', item)

				this.searchProcessing = true

				if (type === 'balance') {
					this.query = item.user_code
				}

				if (type === 'pnl') {
					this.query = item.user_code
				}

				if (type === 'transaction') {
					this.query = item['complex_transaction.code']
				}

				this.spaceStore.searchQuery = this.query;

				this.$emit('resultSelectCallback', {
					query: this.query,
					type: type,
					result: item
				})

				this.searchProcessing = false

			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {

			this.query = this.spaceStore.searchQuery;

		},
		beforeUnmount() {


		}
	}

</script>

<style lang="scss" scoped>

	.search-result-item-card {

		background: var(--ion-card-background);
		padding: 9px;
		padding-top: 6px;
		//border-radius: 5px;
		border-radius: 1.5rem;
		//width: 132px;
		width: 100%;
		min-height: 170px;
		padding: 1rem;
		box-sizing: border-box;
		box-shadow: var(--ion-card-box-shadow);
		border: 1px dotted var(--ion-card-border-color);
		margin-bottom: 1rem;

	}

	.search-result-item-card-header {
		font-size: .8rem;
		padding: 0.25rem 0.5rem;
		opacity: .7;
		margin-bottom: 0.25rem;
	}

	.search-dialog-wrap {
		position: relative;

		.clear-search-result-icon-button {
			position: absolute;
			right: 1.5rem;
			top: 1.5rem;
		}

		padding-bottom: 5rem;
	}


</style>
