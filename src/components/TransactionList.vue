<template>
	<div class="transactions">
		<div class="transactions_wrap" v-for="item in transactions" :key="item.id">
			<div
				class="transactions_item"
				:class="{ active: openDescId == item.id }"
				@click="openDescId = item.id == openDescId ? null : item.id"
			>
				<div class="pi_first_line flex aic sb">
					<div class="ti_date">
						{{ dayjs(item.transaction_date).format('DD MMM YYYY') }}
					</div>
					<div class="ti_header">
						{{
							displayMode != 'compact'
								? transaction_classes.find(
										(o) => o.id == item.transaction_class
								  )?.name
								: transaction_portfolios.find((o) => o.id == item.portfolio)
										?.name
						}}
					</div>
				</div>

				<div class="flex aic sb">
					<div class="name">
						{{
							item.transaction_item_name.slice(
								0,
								displayMode != 'compact' ? 24 : 35
							)
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
						POS
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
							item_currencies.find((o) => o.id == item.settlement_currency)
								?.short_name
						}}
					</div>
				</div>
			</div>

			<div class="transactions_desc_block" v-if="openDescId == item.id">
				<template v-for="field in userFieldsMap">
					<div
						class="tdb_row flex sb"
						v-if="item['complex_transaction.' + field.key]"
					>
						<div class="tdb_prop">{{ field.name }}:</div>
						<div class="tdb_value">
							{{ item['complex_transaction.' + field.key] }}
						</div>
					</div>
				</template>
				<div class="tac" v-if="!userFieldsMap.length">No description</div>
			</div>
		</div>

		<template v-if="transactions === null">
			<div class="transactions_wrap" v-for="item in [1, 1]">
				<div class="transactions_item">
					<div class="pi_first_line flex aic sb">
						<div class="ti_date">
							<IonSkeletonText
								:animated="true"
								style="width: 80px; height: 24px"
							/>
						</div>
						<div class="ti_header" style="width: 25%">
							<IonSkeletonText :animated="true" style="height: 24px" />
						</div>
					</div>

					<div class="flex aic sb">
						<div class="name" style="width: 35%">
							<IonSkeletonText :animated="true" style="height: 24px" />
						</div>
						<div class="pos" style="width: 15%" v-if="displayMode != 'compact'">
							<IonSkeletonText :animated="true" style="height: 24px" />
						</div>
					</div>
					<div class="flex sb">
						<div class="desc" style="width: 50%">
							<IonSkeletonText :animated="true" style="height: 24px" />
						</div>
						<div class="pos" style="width: 25%" v-if="displayMode != 'compact'">
							<IonSkeletonText :animated="true" style="height: 24px" />
						</div>
					</div>
				</div>
			</div>
		</template>

		<div
			class="transactions_wrap transactions_item"
			v-if="transactions?.length === 0"
		>
			No transactions
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'
	import { onMounted, ref, reactive, watch } from 'vue'
	import useApi from '@/composables/useApi'
	import { IonSkeletonText } from '@ionic/vue'

	const props = defineProps({
		displayMode: String,
		reportType: String,
		options: Object,
	})

	let openDescId = ref(null)

	let transactions = ref(null)
	let userFieldsMap = ref(null)

	let transaction_classes = []
	let transaction_portfolios = []
	let item_currencies = []

	init()

	watch(props.options, (newval, oldVal) => {
		init()
	})

	async function init() {
		transactions.value = null
		let res = await fetchReport()

		transaction_classes = res.item_transaction_classes
		transaction_portfolios = res.item_portfolios
		item_currencies = res.item_currencies

		transactions.value = res.items.sort(
			(a, b) =>
				new Date(b.transaction_date).getTime() -
				new Date(a.transaction_date).getTime()
		)

		res = await useApi('transactionUserField.get')

		userFieldsMap.value = res.results.filter((o) => o.is_active)
	}

	async function fetchReport() {
		let res = await useApi('transactionReport.post', {
			body: {
				account_mode: 1,
				accounts: [],
				accounts_cash: [],
				accounts_object: [],
				accounts_position: [],
				approach_multiplier: 0.5,
				begin_date: props.options.begin_date,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				custom_fields_to_calculate: '',
				date_field: 'accounting_date',
				depth_level: props.reportType == 'pl' ? 'base_transaction' : 'entry',
				end_date: props.options.end_date,
				expression_iterations_count: 1,
				filters: [
					{
						key: 'entry_item_user_code',
						groups: false,
						columns: true,
						filters: true,
						name: 'Transaction. Entry Item User Code',
						value_type: 10,
						options: {
							filter_type: 'equal',
							filter_values: [props.options.filter_entry_user_code],
							exclude_empty_cells: false,
							enabled: true,
							use_from_above: {},
						},
					},

					{
						content_type: 'portfolios.portfolio',
						filtersListIndex: 1,
						key: 'portfolio.user_code',
						name: 'Portfolio. User code',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'equal',
							filter_values: props.options.portfolios,
							use_from_above: {
								attrs_entity_type: 'balance-report', // report
								key: 'portfolio.user_code',
							},
						},
						value_type: 10,
					},
				],
				portfolio_mode: 1,
				pricing_policy: 1,
				portfolios: [],
				strategies1: [],
				strategies2: [],
				strategies3: [],
				strategy1_mode: 0,
				strategy2_mode: 0,
				strategy3_mode: 0,
				table_font_size: 'small',
				task_id: null,
			},
		})
		let x = {
			date_field: 'transaction_date',
		}

		if (!props.options.filter_entry_user_code) return res

		//depricated
		if (props.reportType != 'pl') {
			res.items = res.items.filter(
				(o) => o.entry_item_user_code == props.options.filter_entry_user_code
			)
		} else {
			res.items = res.items.filter(
				(o) =>
					o.transaction_item_user_code == props.options.filter_entry_user_code
			)
		}

		return res
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
		background: #fff;
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
		background: #fff;
		border-top: 1px solid rgba(224, 224, 224, 1);
	}
	.ti_header {
		font-weight: 500;
		font-size: 14px;
		line-height: 24px;
		color: #747474;
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
		border-top: 1px solid rgba(224, 224, 224, 1);
	}
</style>
