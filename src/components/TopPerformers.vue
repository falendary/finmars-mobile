<template>
	<div class="top-performers">

		<div v-if="!processing">

			<h3>Best Performers</h3>

			<div v-for="item in topPositions" :key="item.id" class="top-performer-item">
				<position-item :item="item" :item-type="'pl'"
											 :portfolios="spaceStore.settings.general.portfolios"></position-item>
			</div>


			<h3>Worst Performers</h3>

			<div v-for="item in worstPositions" :key="item.id" class="top-performer-item">
				<position-item :item="item" :item-type="'pl'"
											 :portfolios="spaceStore.settings.general.portfolios"></position-item>
			</div>

		</div>

		<div class="portfolio-metric-grid-container" v-if="processing">

			<IonSkeletonText
				:animated="true"
				style="width: 30%; height: 24px; margin-bottom: .5rem; margin-top: 1rem;"
			/>

			<div v-for="(metric, index) in [1,1,1,1,1]" :key="index" class="top-performer-item">
				<IonSkeletonText
					:animated="true"
					style="width: 55%; height: 16px;"
				/>
				<IonSkeletonText
					:animated="true"
					style="width: 25%; height: 16px"
				/>
			</div>

			<IonSkeletonText
				:animated="true"
				style="width: 30%; height: 24px; margin-bottom: .5rem; margin-top: 1rem;"
			/>

			<div v-for="(metric, index) in [1,1,1,1,1]" :key="index" class="top-performer-item">
				<IonSkeletonText
					:animated="true"
					style="width: 55%; height: 16px;"
				/>
				<IonSkeletonText
					:animated="true"
					style="width: 25%; height: 16px"
				/>
			</div>


		</div>


	</div>
</template>

<script>
	import {
		IonApp,
		IonButton,
		IonButtons,
		IonDatetime,
		IonDatetimeButton,
		IonIcon,
		IonModal,
		IonRouterOutlet,
		IonSelect,
		IonSelectOption,
		IonSkeletonText
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import useApi from '@/composables/useApi.js'
	import errorService from '@/services/errorService.js'
	import PositionItem from '@/components/PositionItem.vue'

	export default {
		components: {
			IonDatetimeButton,
			IonDatetime,
			PositionItem,
			IonSkeletonText,
			IonIcon,
			IonModal,
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode,
			IonSelect,
			IonSelectOption
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {
			portfolio: {
				type: String,
				required: true
			}
		},
		emits: ['refresher'],
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				portfolioHistoryItems: [],
				processing: false,
				topPositions: [],
				worstPositions: []
			}
		},
		methods: {
			async refresh() {
				await this.fetchPositions()
			},
			async fetchPositions() {

				this.processing = true
				this.positionsError = ''
				this.positions = []
				this.topPositions = []
				this.worstPositions = []

				try {

					let res = await useApi('backendPLReportItems.post', {
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
							date_field: 'transaction_date',
							depth_level: 'base_transaction',
							expression_iterations_count: 1,
							frontend_request_options: {
								groups_types: [],
								groups_values: [],
								page: 1,
								filter_settings: []
							},
							pl_include_zero: false,
							portfolio_mode: 1,
							portfolios: this.spaceStore.settings.general.portfolios,
							pricing_policy: this.spaceStore.settings.general.pricing_policy,
							report_currency: this.spaceStore.settings.general.currency,
							report_date: this.spaceStore.settings.general.date_to,
							period_type: this.spaceStore.settings.general.period_type,
							// pl_first_date: this.spaceStore.settings.general.date_from,
							report_type: 1,
							show_balance_exposure_details: false,
							show_transaction_details: true,
							strategies1: [],
							strategies2: [],
							strategies3: [],
							strategy1_mode: 0,
							strategy2_mode: 0,
							strategy3_mode: 0,
							table_font_size: 'small',
							transaction_classes: [],
							task_id: null
						}
					})


					this.positions = res.items;

					this.positions = this.positions.filter((item) => {
						return item.item_type === 1;
					})


					let limit = 5
					this.positions.sort((a, b) => b.total - a.total).forEach((item, index) => {

						if (index < limit) {
							this.topPositions.push(item)
						}

					})

					this.positions.sort((a, b) => a.total - b.total).forEach((item, index) => {

						if (index < limit) {
							this.worstPositions.push(item)
						}

					})

				} catch (error) {
					console.error('Pnl.fetchPositions.error', error)
					this.positionsError = errorService.getRandomErrorMessage()
				}


				this.processing = false

			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

			this.$emit('refresher', this.refresh)

		},
		mounted() {

			this.fetchPositions()

		},
		beforeUnmount() {

		}
	}

</script>

<style lang="scss" scoped>

	.top-performers {
		width: 100%;
	}

	h3 {
		margin-bottom: .5rem;
	}

	.top-performer-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: .5rem;
	}

	.top-performer-item-name {
		font-size: .6rem;
	}

	.top-performer-item-price {
		font-size: .7rem;
		padding: 0.25rem 0.5rem;

		&.plus {
			//background: rgba(52, 199, 89, 0.17);
			color: rgba(52, 199, 89, 1);
		}

		&.minus {
			//background: var(--ion-background-color);
			color: #ff2d55;
		}

		&.neutral {
			//background: #EFEFEF;
			color: #747474;
		}

	}

</style>
