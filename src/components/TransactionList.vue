<template>
	<div class="transactions">

		<div v-if="!processing">

			<div v-if="transactions.length">
				<div class="transactions_wrap" v-for="(item, index) in transactions" :key="index">
					<div
						class="transactions_item"
						:class="{ active: openDescId == item.id }"
						@click="openDescId = item.id == openDescId ? null : item.id"
					>
						<div class="pi_first_line flex aic sb">
							<div class="ti_date">
								{{ dayjs(item.accounting_date).format('DD MMM YYYY') }}
							</div>
							<div class="ti_header">
								{{
									item['transaction_class.name']
								}}
							</div>
						</div>

						<div class="flex aic sb">
							<div class="name">
								{{
									item.notes
								}}
							</div>
							<div class="pos" v-if="displayMode != 'compact'">
						<span
							:class="[
								item[
									reportType == 'pl'
										? 'position_size_with_sign'
										: 'entry_amount'
								] > 0
									? 'plus'
									: 'minus',
							]"
						>{{
								$format(
									item[
										reportType == 'pl'
											? 'position_size_with_sign'
											: 'entry_amount'
										]
								)
							}}</span
						>
								UNITS
							</div>
						</div>
						<div class="flex sb">
							<div class="desc">
								{{
									item['complex_transaction.text']?.slice(
										0,
										displayMode != 'compact' ? 30 : 40
									)
								}}
							</div>
							<div class="pos" v-if="displayMode != 'compact'">
						<span :class="[item.cash_consideration > 0 ? 'plus' : 'minus']">{{
								$format(item.cash_consideration)
							}}</span>
								{{
									item['settlement_currency.short_name']
								}}
							</div>
						</div>
					</div>

					<div class="transactions_desc_block" v-if="openDescId == item.id">
						<template v-for="field in userFieldsMap">
							<div class="tdb_row flex sb"
								v-if="item['complex_transaction.' + field.key] && item['complex_transaction.' + field.key] !== '-'"
							>
								<div class="tdb_prop">{{ field.name }}:</div>
								<div class="tdb_value" v-if="field.key.indexOf('user_number_') !== -1">
									{{ $format(item['complex_transaction.' + field.key]) }}
								</div>
								<div class="tdb_value" v-if="field.key.indexOf('user_number_') === -1">
									{{ item['complex_transaction.' + field.key] }}
								</div>
							</div>
						</template>
						<div class="tac" v-if="!userFieldsMap.length">No description</div>
					</div>
				</div>
			</div>
			<div
				class="transactions_wrap transactions_item"
				v-if="transactions.length === 0"
			>
				No transactions
			</div>


			<div v-if="count > page * page_size">

				<div class="display-flex" style="margin-top: 1rem; justify-content: space-between; align-items: center">
					<div style="font-size: .8rem; opacity: .7;">
						Transactions {{ transactions.length}} / {{count}}
					</div>

					<div class="display-flex align-center justify-center" v-if="loadMoreProcessing">
						<progress-circular diameter="20"></progress-circular>
					</div>

				</div>


				<ion-button
					class="ion-margin-horizontal"
					fill="outline"
					expand="block"
					@click="loadMore()"
				>
					Load More
				</ion-button>

			</div>

		</div>


		<div v-if="processing">
			<div class="transactions_wrap" v-for="item in [1, 1]">
				<div class="transactions_item">
					<div class="pi_first_line flex aic sb">
						<div class="ti_date">
							<IonSkeletonText
								:animated="true"
								style="width: 80px; height: 24px; margin-bottom: 0.25rem"
							/>
						</div>
						<div class="ti_header" style="width: 25%">
							<IonSkeletonText :animated="true" style="height: 24px ; margin-bottom: 0.25rem" />
						</div>
					</div>

					<div class="flex aic sb">
						<div class="name" style="width: 35%">
							<IonSkeletonText :animated="true" style="height: 24px; margin-bottom: 0.25rem" />
						</div>
						<div class="pos" style="width: 15%" v-if="displayMode != 'compact'">
							<IonSkeletonText :animated="true" style="height: 24px; margin-bottom: 0.25rem" />
						</div>
					</div>
					<div class="flex sb">
						<div class="desc" style="width: 50%">
							<IonSkeletonText :animated="true" style="height: 24px; margin-bottom: 0.25rem" />
						</div>
						<div class="pos" style="width: 25%" v-if="displayMode != 'compact'">
							<IonSkeletonText :animated="true" style="height: 24px; margin-bottom: 0.25rem" />
						</div>
					</div>
				</div>
			</div>
		</div>


	</div>
</template>

<script>

	import { IonButton, IonSkeletonText } from '@ionic/vue'
	import { computed } from 'vue'
	import useStore from '@/composables/useStore.js'

	import dayjs from 'dayjs'
	import useApi from '@/composables/useApi.js'
	import ProgressCircular from '@/components/ProgressCircular.vue'

	export default {
		components: {
			ProgressCircular,
			IonButton,
			IonSkeletonText
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {
			options: {
				type: Object,
				required: true
			},
			reportType: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,

				dayjs: dayjs,
				openDescId: null,
				transactions: [],
				userFieldsMap: [],
				displayMode: 'full',
				processing: false,
				count: 0,
				page_size: 40,
				page: 1,
				loadMoreProcessing: false
			}
		},
		methods: {

			async fetchReport() {

				let filters = []

				// console.log('props.options.portfolios', this.options.portfolios)

				if (this.options.filter_entry_user_code) {

					if (this.reportType === 'balance') {

						filters = [
							{
								key: 'entry_item_user_code',
								groups: false,
								columns: true,
								filters: true,
								name: 'Transaction. Entry Item User Code',
								value_type: 10,
								options: {
									filter_type: 'equal',
									filter_values: [this.options.filter_entry_user_code],
									exclude_empty_cells: false,
									enabled: true,
									use_from_above: {}
								}
							}
						]
					} else {

						filters = [] // pl context cant do entry sql filter

					}

				}

				var filter_settings = []

				if (this.reportType == 'pl') {
					filter_settings = [
						{
							'key': 'transaction_item_user_code',
							'filter_type': 'contains',
							'exclude_empty_cells': false,
							'value_type': 10,
							'value': [
								this.options.filter_entry_user_code
							]
						}
					]
				}

				let res = await useApi('backendTransactionReportItems.post', {
					body: {
						accounts: [],
						begin_date: this.options.begin_date,
						calculationGroup: 'portfolio',
						complex_transaction_statuses_filter: 'booked',
						custom_fields_to_calculate: '',
						date_field: 'accounting_date',
						// depth_level: props.reportType == 'pl' ? 'base_transaction' : 'entry',
						depth_level: this.options.dept_level,
						end_date: this.options.end_date,
						expression_iterations_count: 1,
						frontend_request_options: {
							// columns: columns,
							columns: [],
							groups_types: [],
							filter_settings: filter_settings,
							items_order: 'desc',
							ordering: "accounting_date"
						},
						page: this.page,
						filters: filters,
						portfolios: this.options.portfolios,
						strategies1: [],
						strategies2: [],
						strategies3: [],
						table_font_size: 'small'
					}
				})

				// if (this.reportType == 'balance') {
				// 	res.items = res.items.filter(
				// 		(o) => o.entry_item_user_code == this.options.filter_entry_user_code
				// 	)
				// } else {
				// 	res.items = res.items.filter(
				// 		(o) =>
				// 			o.transaction_item_user_code == this.options.filter_entry_user_code
				// 	)
				// }

				this.count = res.count

				return res
			},

			async loadMore() {

				this.loadMoreProcessing = true;

				this.page = this.page + 1

				let res = await this.fetchReport()

				res.items.sort(
					(a, b) =>
						new Date(b.accounting_date).getTime() -
						new Date(a.accounting_date).getTime()
				).forEach((item) => {
					this.transactions.push(item)
				})


				this.loadMoreProcessing = false;

			},

			async init() {

				this.processing = true

				this.transactions = []
				let res = await this.fetchReport()

				this.transactions = res.items;

				const transactionUserFieldsRes = await useApi('transactionUserField.get')

				this.userFieldsMap = transactionUserFieldsRes.results.filter((o) => o.is_active)

				this.processing = false
			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())


		},
		mounted() {

			this.init()

		},
		beforeUnmount() {

		}
	}


</script>

<style lang="scss" scoped>
	.transactions {
		padding: 0 15px;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
		border-radius: 5px;
	}

	.transactions_item {
		padding: 7px 13px;
		background: var(--ion-card-background);
		transition: 0.3s;

		&.active {
			background: rgba(255, 138, 0, 0.2);
		}

		& + & {
			border-top: 1px solid rgba(224, 224, 224, 1);
		}
	}

	.transactions_desc_block {
		padding: 15px 13px;
		background: var(--ion-card-background);
		border-top: 1px solid var(--ion-card-border-color);
	}

	.ti_header {
		font-weight: 500;
		font-size: 14px;
		line-height: 24px;
		color: var(--ion-text-color);
	}

	.ti_date {
		font-weight: 500;
		font-size: 14px;
		line-height: 24px;
		color: #747474;
	}

	.pos {
		font-weight: 600;
		font-size: 12px;
		line-height: 24px;
		white-space: nowrap;
	}

	.desc {
		font-size: 14px;
		line-height: 24px;
	}

	.name {
		font-size: 16px;
		line-height: 24px;
	}

	.plus {
		color: rgba(52, 199, 89, 1);
	}

	.minus {
		color: #ff2d55;
	}

	.neutral {
		color: #747474;
	}

	.tdb_row + .tdb_row {
		margin-top: 4px;
	}

	.tdb_prop {
		font-size: 14px;
		line-height: 16px;
		color: #747474;
	}

	.tdb_value {
		font-size: 14px;
		line-height: 16px;
		text-align: right;
	}

	.tdb_row + .tdb_row {
		margin-top: 10px;
	}

	.transactions_wrap + .transactions_wrap {
		border-top: 1px solid var(--ion-transaction-card-border-color);
	}
</style>
