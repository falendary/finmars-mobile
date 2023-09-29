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
							item['settlement_currency.short_name']
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

	// need for frontend_request_options
	// only columns that requested will be shown
	const columns = [
		{
			"content_type": "transactions.complextransaction",
			"isHidden": false,
			"key": "complex_transaction.code",
			"layout_name": "Trade ID",
			"name": "Complex Transaction. Code",
			"options": {
				"sort": "DESC",
				"sort_mode": "default",
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"columns": true,
			"content_type": "transactions.complextransaction",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "complex_transaction.user_date_1",
			"layout_name": "Date (Trade)",
			"name": "Complex Transaction. Date (Trade)",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 24,
			"style": {
				"width": "100px"
			},
			"value_type": 40
		},
		{
			"columns": true,
			"content_type": "reports.transactionreport",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "cash_consideration",
			"layout_name": "Amount/Cash",
			"name": "Transaction. Cash consideration",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 3,
			"report_settings": {
				"negative_color_format_id": 1,
				"negative_format_id": 1,
				"number_multiplier": null,
				"number_prefix": "",
				"number_suffix": "",
				"percentage_format_id": 0,
				"round_format_id": 1,
				"subtotal_formula_id": 1,
				"thousands_separator_format_id": 2,
				"zero_format_id": 1
			},
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"columns": true,
			"isHidden": false,
			"key": "entry_amount",
			"layout_name": "Entry Amount",
			"name": "Transaction. Entry Amount",
			"options": {
				"numberFormat": {
					"negative_color_format_id": 1,
					"negative_format_id": 0,
					"number_multiplier": null,
					"number_prefix": "",
					"number_suffix": "",
					"percentage_format_id": 0,
					"round_format_id": 3,
					"subtotal_formula_id": 1,
					"thousands_separator_format_id": 2,
					"zero_format_id": 1
				},
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"report_settings": {
				"subtotal_formula_id": 1
			},
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"key": "entry_item_user_code",
			"layout_name": "Entry User Code",
			"name": "Transaction. Entry User Code",
			"value_type": 10
		},
		{
			"content_type": "transactions.complextransaction",
			"isHidden": false,
			"key": "complex_transaction.text",
			"layout_name": "Description",
			"name": "Complex Transaction. Description",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"style": {
				"width": "319px"
			},
			"value_type": 10
		},
		{
			"columns": true,
			"content_type": "transactions.complextransaction",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "complex_transaction.user_text_4",
			"layout_name": "Instrument/Currency",
			"name": "Complex Transaction. Instrument",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 3,
			"style": {
				"width": "118px"
			},
			"value_type": 10
		},
		{
			"columns": true,
			"content_type": "reports.transactionreport",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "position_size_with_sign",
			"layout_name": "Position/Quantity",
			"name": "Transaction. Position Size with sign",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 2,
			"report_settings": {
				"negative_color_format_id": 1,
				"negative_format_id": 1,
				"number_multiplier": null,
				"number_prefix": "",
				"number_suffix": "",
				"percentage_format_id": 0,
				"round_format_id": 1,
				"thousands_separator_format_id": 2,
				"zero_format_id": 1
			},
			"style": {
				"width": "73px"
			},
			"value_type": 20
		},
		{
			"columns": true,
			"content_type": "transactions.complextransaction",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "complex_transaction.user_number_7",
			"layout_name": "Price",
			"name": "Complex Transaction. Traded Price",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 23,
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"columns": true,
			"content_type": "reports.transactionreport",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "principal_with_sign",
			"layout_name": "Principal",
			"name": "Transaction. Principal with sign",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 4,
			"report_settings": {
				"negative_color_format_id": 1,
				"negative_format_id": 1,
				"number_multiplier": null,
				"number_prefix": "",
				"number_suffix": "",
				"percentage_format_id": 0,
				"round_format_id": 1,
				"thousands_separator_format_id": 2,
				"zero_format_id": 1
			},
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"columns": true,
			"content_type": "reports.transactionreport",
			"filters": false,
			"groups": false,
			"isHidden": false,
			"key": "carry_with_sign",
			"layout_name": "Accrued",
			"name": "Transaction. Carry with sign",
			"options": {
				"sort": null,
				"sort_settings": {
					"mode": null
				}
			},
			"orderNumber__": 5,
			"report_settings": {
				"negative_color_format_id": 1,
				"negative_format_id": 1,
				"number_multiplier": null,
				"number_prefix": "",
				"number_suffix": "",
				"percentage_format_id": 0,
				"round_format_id": 1,
				"thousands_separator_format_id": 2,
				"zero_format_id": 1
			},
			"style": {
				"width": "100px"
			},
			"value_type": 20
		},
		{
			"key": "complex_transaction.user_text_1",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 1",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_2",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 2",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_3",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 3",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_5",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 5",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_6",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 6",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_7",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 7",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_8",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 8",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_9",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 9",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_10",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 10",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_11",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 11",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_12",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 12",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_13",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 13",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_14",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 14",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_15",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 15",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_16",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 16",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_17",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 17",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_18",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 18",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_19",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 19",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_text_20",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Text 20",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_1",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 1",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_2",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 2",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_3",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 3",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_4",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 4",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_5",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 5",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_6",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 6",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_8",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 8",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_10",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 10",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_9",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 9",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_11",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 11",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_12",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 12",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_13",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 13",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_14",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 14",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_15",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 15",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_16",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 16",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_17",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 17",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_18",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 18",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_19",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 19",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_number_20",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Number 20",
			"value_type": 20,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_date_3",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Date 3",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_date_2",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Date 2",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_date_4",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Date 4",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.user_date_5",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. User Date 5",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "transaction_class.name",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Transaction. Transaction class. Name",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "notes",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Transaction. Notes",
			"value_type": 10,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"isHidden": false
		},
		{
			"key": "complex_transaction.date",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Complex Transaction. Date",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"___column_id": "666649592bc77832533730bdebdbe52c",
			"isHidden": false
		},
		{
			"key": "accounting_date",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Transaction. Accounting date",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"___column_id": "69f589c5396a46d6d1a46a8f3dc7cb6a",
			"isHidden": false
		},
		{
			"key": "cash_date",
			"groups": false,
			"columns": true,
			"filters": false,
			"name": "Transaction. Cash date",
			"value_type": 40,
			"options": {
				"sort": null,
				"sort_settings": {}
			},
			"style": {
				"width": "100px"
			},
			"___column_id": "6f41d5d9f8f4752afb5e1aa9ea1b1236",
			"isHidden": false
		}
	]

	init()

	watch(props.options, (newval, oldVal) => {
		init()
	})

	async function init() {
		transactions.value = null
		let res = await fetchReport()

		// transaction_classes = res.item_transaction_classes
		transaction_portfolios = res.item_portfolios
		item_currencies = res.item_currencies

		transactions.value = res.items.sort(
			(a, b) =>
				new Date(b.transaction_date).getTime() -
				new Date(a.transaction_date).getTime()
		)

		const transactionUserFieldsRes = await useApi('transactionUserField.get')

		userFieldsMap.value = transactionUserFieldsRes.results.filter((o) => o.is_active)
	}



	async function fetchReport() {

		let filters = []

		console.log('props.options.portfolios', props.options.portfolios);

		if (props.options.filter_entry_user_code) {

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
			]

		}

		let res = await useApi('backendTransactionReportItems.post', {
			body: {
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
				frontend_request_options: {
					columns: columns,
					groups_types: [],
					page: 1,
					filter_settings: []
				},
				filters: filters,
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

		// if (!props.options.filter_entry_user_code) return res

		//depricated
		// if (props.reportType != 'pl') {
		// 	res.items = res.items.filter(
		// 		(o) => o.entry_item_user_code == props.options.filter_entry_user_code
		// 	)
		// } else {
		// 	res.items = res.items.filter(
		// 		(o) =>
		// 			o.transaction_item_user_code == props.options.filter_entry_user_code
		// 	)
		// }

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
