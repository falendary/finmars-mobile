<template>
	<div class="transactions">
		<div v-for="item in transactions" :key="item.id">
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
							transaction_classes.find((o) => o.id == item.transaction_class)
								?.name
						}}
					</div>
				</div>

				<div class="flex sb">
					<div>{{ item.transaction_item_name }}</div>
					<div class="pos">
						<span class="plus">{{ $format(item.entry_amount) }}</span>
						POS
					</div>
				</div>
				<div class="flex sb">
					<div class="name">
						{{ item['complex_transaction.text'].slice(0, 30) }}
					</div>
					<div class="pos">
						<span class="plus">{{ $format(item.cash_consideration) }}</span>
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
			</div>
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'
	import { onMounted, ref, reactive } from 'vue'
	import useApi from '@/composables/useApi'

	const props = defineProps({
		options: Object,
	})

	let openDescId = ref(null)
	let res = await fetchReport()
	console.log('res:', res)

	let transaction_classes = res.item_transaction_classes
	let item_currencies = res.item_currencies

	let transactions = reactive(
		res.items.sort((a, b) => b.transaction_date - a.transaction_date)
	)

	async function fetchReport() {
		let res = await useApi('transactionReport.post', {
			body: {
				account_mode: 0,
				accounts: [],
				accounts_cash: [],
				accounts_cash_object: [],
				accounts_object: [],
				accounts_position: [],
				accounts_position_object: [],
				approach_multiplier: 0.5,
				begin_date: props.options.begin_date,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				custom_fields_to_calculate: '',
				date_field: 'accounting_date',
				depth_level: 'entry',
				end_date: props.options.end_date,
				expression_iterations_count: 1,
				filters: [
					{
						content_type: 'reports.transactionreport',
						filtersListIndex: 0,
						key: 'entry_item_user_code',
						name: 'Transaction. Entry Item User Code',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'equal',
							filter_values: props.options.filter_entry_user_code,
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'user_code',
							},
						},
						value_type: 10,
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
							filter_values: ['Model'],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'portfolio.user_code',
							},
						},
						value_type: 10,
					},
					{
						content_type: 'accounts.account',
						filtersListIndex: 2,
						key: 'entry_account.user_code',
						name: 'Transaction. Entry Account. User code',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'equal',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'account.user_code',
							},
						},
						value_type: 10,
					},
				],
				portfolio_mode: 1,
				portfolios: [],
				portfolios_object: [],
				strategies1: [],
				strategies1_object: [],
				strategies2: [],
				strategies2_object: [],
				strategies3: [],
				strategies3_object: [],
				strategy1_mode: 0,
				strategy2_mode: 0,
				strategy3_mode: 0,
				table_font_size: 'small',
				task_id: null,
			},
		})

		return res
	}

	let userFieldsMap = ref(null)

	onMounted(async () => {
		let res = await useApi('transactionUserField.get')

		userFieldsMap.value = res.results
	})
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
		border-bottom: 1px solid rgba(224, 224, 224, 1);
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
	.name {
		font-size: 12px;
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
</style>
