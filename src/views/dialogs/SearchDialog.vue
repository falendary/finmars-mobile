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

			<div>

				<ion-searchbar id="searchBar" :debounce="1000" @ionInput="handleSearch($event)"></ion-searchbar>

				<div style="margin-top: 0.5rem; min-height: 50vh;" class="position-relative">

					<div v-if="searchResults.length && searchQuery">

						<div v-for="(item, index) in searchResults" v-bind:key="index" @click="submitSearchResult($event, item)"
								 class="search-result-item">

							<ion-card>

								<ion-card-header>
									<ion-card-subtitle>{{ item.name }}</ion-card-subtitle>
								</ion-card-header>

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

							</ion-card>

						</div>

					</div>

					<div v-if="!searchResults.length && searchQuery && !searchProcessing" class="text-center">

						<ion-icon :icon="icons.telescopeOutline" size="large"></ion-icon>

						<h1>No Results Found</h1>
						<p>Try different search</p>

					</div>

					<div v-if="searchProcessing" class="loading-overlay">

						<div class="display-flex align-center justify-center height-100">
							<progress-circular diameter="90"></progress-circular>
						</div>

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
			IonModal
		},
		props: {
			portfolios: Array, // Data to display in the modal
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
				searchResults: [],
				searchQuery: null

			}
		},
		watch: {
			async isOpen(newVal) {
				if (newVal) {
					this.searchQuery = ''
					this.searchResults = []
					this.searchProcessing = false
					setTimeout(async () => {
						document.querySelector('#searchBar input').focus()
					}, 100)
				}
			}
		},
		emits: ['close', 'resultSelectCallback'],
		methods: {
			closeSearchDialog() {
				this.$emit('close')
			},

			async handleSearch(event) {

				this.searchProcessing = true


				try {
					console.log('handleSearch', event)

					this.searchQuery = event.target.value.toLowerCase()

					let res = await useApi('backendBalanceReportItems.post', {
						body: {
							account_mode: this.spaceStore.settings.balance.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
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
								globalTableSearch: this.searchQuery,
								page: 1,
								groups_values: [],
								groups_types: []
							},
							pl_include_zero: false,
							portfolio_mode: 1,
							portfolios: this.portfolios,
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

					this.searchProcessing = false

					this.searchResults = res.items

				} catch (error) {

					console.error('error', error)

					this.searchResults = []
					this.searchProcessing = false

				}

			},

			async submitSearchResult(event, item) {

				console.log('SearchDialog.submitSearchResult.item', item)

				this.searchProcessing = true

				this.$emit('resultSelectCallback', item)

				this.searchProcessing = false

				this.closeSearchDialog()
			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		async mounted() {


		},
		beforeUnmount() {


		}
	}

</script>

<style lang="scss" scoped>

	.search-result-item {

	}


</style>
