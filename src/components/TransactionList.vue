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

	// need for frontend_request_options
	// only columns that requested will be shown
	const columns = [
		{
			"___column_id": "37573232cc8f8e871152adc27dd74d69",
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
			"___column_id": "948dc4afb985f82517b70cd9eb17ab75",
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
			"___column_id": "3e6cb9f296d2f740b343f42f878bff4a",
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
			"___column_id": "0371028dd282db3779a931a9f02769dd",
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
			"___column_id": "50c42e4144f3c1a5b8305d4356072569",
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
			"___column_id": "71f240c427db93602d9f230d896c8d17",
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
			"___column_id": "a01c6a2c6d642e2fe2c6d35091616765",
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
			"___column_id": "66d97c178f8747499a0083854a47eb8a",
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
			"___column_id": "92dca03a91a4f4c3a1d9a7c11de85a88",
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
			"___column_id": "0af49b3b463f39bd4fb22430e6e291f1",
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
			"___column_id": "87a4cb926d50b7687a839c23a3d8856a",
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
			"___column_id": "a667a81021493950c387ed5f7d1a0758",
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
			"___column_id": "eeea2c6d2ac359d7d69722b490612bb4",
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
			"___column_id": "11a55d64c21f2d19219be5bc466e9c4b",
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
			"___column_id": "c73258f2172b2a06e755cd4e09868506",
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
			"___column_id": "c9b720b7eff12fb18859e39f52ecf843",
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
			"___column_id": "89555b7793c994c10a889f5e658b2cef",
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
			"___column_id": "ed20641495f114719de51375c1e0e3e1",
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
			"___column_id": "423812693934475dd949d25d2ab1b0d3",
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
			"___column_id": "71f86e841584effc81cb2d19762f40e3",
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
			"___column_id": "b5a09ec6fddc70faf27f40e29598b01b",
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
			"___column_id": "712bf5dd3fd74a12fa81dc6b20bf44ac",
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
			"___column_id": "64c1935683aa2dd3e9cea4316cd9bf95",
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
			"___column_id": "eefbe39a1180ef8de5864199e2ad82f7",
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
			"___column_id": "9ca45c5a36f03ba266ee935c65981b95",
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
			"___column_id": "ea9f9bdb0c5235831f29fa3aefa819db",
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
			"___column_id": "920249d3099c4eca84ad805e427bc628",
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
			"___column_id": "07d8cf4af4afb67c32742ae4bcd6475c",
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
			"___column_id": "ee63cc30ef6d908e66635d90eea57b6e",
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
			"___column_id": "547b7cebbfe2a8029363e13a9efbbed4",
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
			"___column_id": "b3e83da41cfc899e6f3b17d0d09dd0a9",
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
			"___column_id": "dbc67c6d18e2a31ad53b692d79619849",
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
			"___column_id": "65b384b0591993e593537bfe1a1869fa",
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
			"___column_id": "cb7ad20d286d474c0a35220b507b5592",
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
			"___column_id": "01201907f54acf548904b687642b8dce",
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
			"___column_id": "fc5cc04d6bc2ea8764e7f9053089a748",
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
			"___column_id": "093f8eea7c53861044a80ce12231d9cc",
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
			"___column_id": "c49c938c099529c02e27e81d0944a255",
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
			"___column_id": "dc5ad025d0eb8ef6c897bd80aec18c1f",
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
			"___column_id": "6c06d8f18b2769efddd01747cb4d372e",
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
			"___column_id": "990a4bbed4c871cbe7913b465f69fa25",
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
			"___column_id": "c699b46fdd278ea4e9cfb7078e95864e",
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
			"___column_id": "2891025eb02c1efc1f00862a8dacfa11",
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
			"___column_id": "20c04e48f33b8f5e780726c4895105dc",
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
			"___column_id": "03067e972936c2c2602e5390b06045f6",
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
			"___column_id": "31ef771df0f6f29d428bec2f0231c223",
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
			"___column_id": "c27af5a39ee88e0f762940dab2705e84",
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
			"___column_id": "91947ff4fd713389d1547f8d77521eb0",
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
			"___column_id": "000777df695f76a10d69c196194c0794",
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
			"___column_id": "5fe1d1f5fd99a614506a9314d73a509e",
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
			"___column_id": "7583109a99f3a851ebba0e7b282c7449",
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
			"___column_id": "be8beff11da425057e780f0c9d1b3c5d",
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
			"___column_id": "316f2b511b5a31ff87f1a326407d5d56",
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
			"___column_id": "461c9a8efca7f842ceeaaa2b92c34126",
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

		res = await useApi('transactionUserField.get')

		userFieldsMap.value = res.results.filter((o) => o.is_active)
	}



	async function fetchReport() {
		let res = await useApi('backendTransactionReportItems.post', {
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
				frontend_request_options: {
					columns: columns,
					groups_types: [],
					page: 1,
					filter_settings: []
				},
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
