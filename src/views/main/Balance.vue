<template>
	<ion-page>
		<ion-content>
			<div class="header flex sb aic">
				<div>All Portfolios</div>
				<div class="header_info">2023-03-16</div>
			</div>

			<swiper
				:pagination="true"
				:modules="[Pagination]"
				class="balance_swiper"
				:loop="true"
				@slideChange="onPortfolioChange"
			>
				<swiper-slide v-for="(item, k) in categories">
					<div class="main_chart">
						<div class="main_chart_h">Net Asset Value (NAV)</div>
						<div class="main_chart_price">126,342.12 USD</div>

						<div
							style="
								height: 80px;
								width: calc(100% + 10px);
								margin: 0 0 -5px -5px;
							"
						>
							<canvas v-if="k == 0" id="lineChart"><p>Chart</p></canvas>
							<div v-else id="lineChart"></div>
						</div>
					</div>
				</swiper-slide>
			</swiper>

			<Indicators
				:items="[
					{
						id: 1,
						name: 'Daily p/l',
						price: 1234,
						currency: 'USD',
						percent: -1.56,
					},
					{
						id: 2,
						name: 'Month to date (MTD) P\L',
						price: 456,
						currency: 'USD',
						percent: 99.88,
					},
					{
						id: 3,
						name: 'Daily p/l',
						price: 1234,
						currency: 'USD',
						percent: 0,
					},
					{
						id: 4,
						name: 'Daily p/l',
						price: 1234,
						currency: 'USD',
						percent: 2.56,
					},
				]"
			/>

			<div class="header flex aic sb">
				Balance
				<ion-checkbox
					v-model="isChartView"
					labelPlacement="start"
					class="chart_view"
					>Chart view</ion-checkbox
				>
			</div>

			<swiper
				:pagination="true"
				:modules="[Pagination]"
				class="balance_swiper aic"
				:loop="true"
				@slideChange="onBalanceChange"
			>
				<swiper-slide v-for="(item, k) in categories">
					<div class="balance_block">
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ item.name }}</div>
							<div class="bb_price">{{ $format(item.total) }} USD</div>
						</div>

						<div class="flex sb">
							<div style="width: 145px; height: 145px" v-show="isChartView">
								<canvas v-if="k == 0" id="balanceChart"><p>Chart</p></canvas>
								<div v-else id="balanceChart"></div>
							</div>

							<div class="balance_labels">
								<div
									class="balance_labels_item flex aic"
									v-for="instr in item.instruments.sort(
										(a, b) => b.total - a.total
									)"
									:class="{ active: detailSubcat == instr.name }"
									@click="detailSubcat = instr.name"
								>
									<div class="balance_labels_percent">
										{{ Math.round((instr.total / item.total) * 100) }}%
									</div>
									<div class="balance_labels_text">{{ instr.name }}</div>
								</div>
							</div>

							<div v-show="!isChartView"></div>
						</div>
					</div>
				</swiper-slide>
			</swiper>

			<template v-if="detailSubcat">
				<div class="header flex aic sb">Details</div>

				<div class="balance_block instr_block">
					<div class="bb_header_line instr_block_header flex sb aic">
						<div class="bb_header">Equity</div>
						<div class="bb_price">{{ $format(2344) }} USD</div>
					</div>

					<div class="instr_block_change flex jcfe">
						<div class="instr_change_percent instr_first minus">
							{{ $format(1254) }}
						</div>
						<div class="instr_change_percent instr_second plus">YTD</div>
					</div>

					<div
						class="instruments"
						v-for="item in instrumentsByCategory"
						:class="{ active: activeInstrumentId == item.id }"
						@click="activeInstrumentId = item.id"
					>
						<div class="flex sb aic">
							<div>{{ item.name }}</div>
							<div class="flex">
								<div class="instr_market_value instr_first">
									{{ $format(item.market_value) }}
								</div>
								<div class="instr_change_percent instr_second">
									{{ item.change.percent }}%
								</div>
							</div>
						</div>
						<div class="flex sb">
							<div class="instr_pos">{{ $format(item.position) }}</div>

							<div class="flex">
								<div class="instr_change_percent instr_first minus">
									{{ $format(item.change.value) }}
								</div>
								<div class="instr_change_percent instr_second plus">YTD</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<template v-if="activeInstrumentId">
				<div class="header flex aic sb">Transactions</div>

				<TransactionList :items="transactionsByInstrument" />
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import { onMounted, ref } from 'vue'

	import dayjs from 'dayjs'
	import { IonCheckbox } from '@ionic/vue'
	import {
		Chart,
		PointElement,
		ArcElement,
		DoughnutController,
		LineController,
		LineElement,
		LinearScale,
		PieController,
		CategoryScale,
		Filler,
		Legend,
		Tooltip,
	} from 'chart.js'

	import Indicators from '@/components/Indicators.vue'
	import TransactionList from '@/components/TransactionList.vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { Pagination } from 'swiper'
	import useApi from '@/composables/useApi'

	Chart.register(
		LineElement,
		PointElement,
		ArcElement,
		DoughnutController,
		LineController,
		PieController,
		CategoryScale,
		LinearScale,
		Filler,
		Legend,
		Tooltip
	)

	let lineChart
	let balanceChart
	let width, height, gradient

	let data = {
		labels: [],
		datasets: [
			{
				data: [],
				hoverOffset: 4,
			},
			{
				data: [],
				circumference: 180,
			},
		],
	}
	let isChartView = ref(true)
	let detailSubcat = ref(null)
	let activeInstrumentId = ref(null)

	let instrumentsByCategory = [
		{
			id: 12,
			name: 'LINGOTS OR 500 GR',
			position: 124456,
			market_value: 8000,
			change: {
				value: 8079,
				percent: 35,
			},
		},
		{
			id: 13,
			name: 'Instrument 2',
			market_value: 7000,
			position: 124456,
			change: {
				value: 8079,
				percent: 35,
			},
		},
	]
	let transactionsByInstrument = [
		{
			id: 12,
			description: 'LINGOTS OR 500 GR',
			date: '15 MAR 2022',
			pos: 124456,
			amount: 8000,
			top_info: 'Buy/Sell',
		},
		{
			id: 12,
			description: 'LINGOTS OR 500 GR',
			date: '15 MAR 2022',
			pos: 124456,
			amount: 8000,
			top_info: 'Buy/Sell',
		},
	]
	let categories = [
		{
			name: 'Assets',
			total: 124456,
			instruments: [
				{ name: 'usd', total: 455 },
				{ name: 'eur', total: 5455 },
				{ name: 'chf', total: 455 },
				{ name: 'UAH', total: -5455 },
			],
		},
		{
			name: 'Currency',
			total: 234456,
			instruments: [
				{ name: 'usd', total: 455 },
				{ name: 'eur', total: 3455 },
				{ name: 'chf', total: 455 },
			],
		},
		{
			name: 'Sector',
			total: 14456,
			instruments: [
				{ name: 'usd', total: 1455 },
				{ name: 'eur', total: 455 },
				{ name: 'UAH', total: 1455 },
			],
		},
	]

	onMounted(async () => {
		createChart()

		let res = await useApi('balanceReport.post', {
			body: {
				account_mode: 1,
				accounts: [],
				accounts_cash: [],
				accounts_cash_object: [],
				accounts_object: [],
				accounts_position: [],
				accounts_position_object: [],
				allocation_detailing: true,
				approach_multiplier: 0.5,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				cost_method_object: {
					description: 'AVCO',
					id: 1,
					name: 'AVCO',
					user_code: 'AVCO',
				},
				custom_fields_to_calculate: 'Sector',
				date_field: 'transaction_date',
				pl_first_date: null,
				pl_include_zero: false,
				portfolio_mode: 1,
				portfolios: [],
				portfolios_object: [],
				pricing_policy: 1,
				pricing_policy_object: {
					deleted_user_code: null,
					expr: '(ask+bid)/2',
					id: 1,
					name: '-',
					notes: null,
					short_name: '-',
					user_code: '-',
				},
				report_currency: 2,
				report_currency_object: {
					deleted_user_code: null,
					id: 2,
					name: 'USD - United States Dollar',
					short_name: 'USD',
					user_code: 'USD',
				},
				report_date: '2022-09-19',
				report_type: 1,
				show_balance_exposure_details: false,
				show_transaction_details: false,
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
				transaction_classes: [],
				transaction_classes_object: [],
				filters: [
					{
						content_type: 'portfolios.portfolio',
						filtersListIndex: 0,
						key: 'portfolio.short_name',
						name: 'Portfolio. Short name',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'portfolio.short_name',
							},
						},
						value_type: 10,
					},
					{
						content_type: 'currencies.currency',
						filtersListIndex: 1,
						key: 'exposure_currency.short_name',
						layout_name: 'Exposure CCY',
						name: 'Balance.  Exposure Currency. Short name',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'exposure_currency.short_name',
							},
						},
						value_type: 10,
					},
					{
						attribute_type: {
							can_recalculate: false,
							deleted_user_code: null,
							expr: '""',
							favorites: null,
							id: 1,
							is_hidden: false,
							kind: 1,
							name: 'Depository',
							notes: null,
							order: 0,
							prefix: null,
							public_name: null,
							short_name: 'Currency (U)',
							tooltip: 'Depository',
							user_code: 'Depository',
							value_type: 30,
						},
						content_type: 'accounts.account',
						filtersListIndex: 2,
						key: 'account.attributes.Depository',
						layout_name: 'Depository',
						name: 'Account. Depository',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'account.attributes.Depository',
							},
						},
						value_type: 30,
					},
					{
						custom_field: {
							expr: "iff(item_type_name=='Currency', 'Cash and equivalents', instrument.attributes.asset_types)",
							id: 1,
							name: 'Asset Types',
							notes: '',
							user_code: 'asset_types',
							value_type: 10,
						},
						expr: "iff(item_type_name=='Currency', 'Cash and equivalents', instrument.attributes.asset_types)",
						filtersListIndex: 3,
						id: 1,
						key: 'custom_fields.asset_types',
						layout_name: 'Asset Types',
						name: 'Custom Field. Asset Types',
						notes: '',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'custom_fields.asset_types',
							},
						},
						user_code: 'asset_types',
						value_type: 10,
					},
					{
						allow_null: true,
						content_type: 'instruments.instrumenttype',
						filtersListIndex: 4,
						key: 'instrument.instrument_type.short_name',
						name: 'Instrument. Instrument type. Short name',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'instrument.instrument_type.short_name',
							},
						},
						value_type: 10,
					},
					{
						attribute_type: {
							can_recalculate: false,
							classifiers: [],
							classifiers_flat: [],
							deleted_user_code: null,
							expr: '""',
							favorites: null,
							id: 19,
							is_hidden: false,
							kind: 1,
							name: 'Sector',
							notes: null,
							order: 0,
							prefix: null,
							public_name: null,
							short_name: 'Sector',
							tooltip: 'sector',
							user_code: 'sector',
							value_type: 10,
						},
						content_type: 'instruments.instrument',
						filtersListIndex: 5,
						key: 'instrument.attributes.sector',
						name: 'Instrument. Sector',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'instrument.attributes.sector',
							},
						},
						value_type: 10,
					},
					{
						attribute_type: {
							can_recalculate: false,
							classifiers: [],
							classifiers_flat: [],
							deleted_user_code: null,
							expr: '""',
							favorites: null,
							id: 20,
							is_hidden: false,
							kind: 1,
							name: 'Sector Type',
							notes: null,
							order: 0,
							prefix: null,
							public_name: null,
							short_name: 'Sector Type',
							tooltip: 'sector_type',
							user_code: 'sector_type',
							value_type: 10,
						},
						content_type: 'instruments.instrument',
						filtersListIndex: 6,
						key: 'instrument.attributes.sector_type',
						name: 'Instrument. Sector Type',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'instrument.attributes.sector_type',
							},
						},
						value_type: 10,
					},
					{
						content_type: 'instruments.country',
						filtersListIndex: 7,
						key: 'instrument.country.region',
						name: 'Instrument. Country. Region',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'instrument.country.region',
							},
						},
						value_type: 10,
					},
					{
						content_type: 'instruments.country',
						filtersListIndex: 8,
						key: 'instrument.country.sub_region',
						name: 'Instrument. Country. Sub Region',
						options: {
							enabled: true,
							exclude_empty_cells: false,
							filter_type: 'contains',
							filter_values: [],
							use_from_above: {
								attrs_entity_type: 'balance-report',
								key: 'instrument.country.sub_region',
							},
						},
						value_type: 10,
					},
				],
				task_id: null,
			},
		})
		console.log('res:', res)
	})

	function onBalanceChange(swiper) {
		let prevChart = swiper.slidesEl.querySelector('canvas#balanceChart')
		let prevChartParent = prevChart.parentNode
		let nextChart =
			swiper.slides[swiper.activeIndex].querySelector('#balanceChart')

		let oldChild = nextChart.parentNode.replaceChild(prevChart, nextChart)
		prevChartParent.append(oldChild)

		let instrs = categories[swiper.realIndex].instruments

		balanceChart.data = createBalanceDataset(instrs)
		balanceChart.update()
	}

	function onPortfolioChange(swiper) {
		let prevChart = swiper.slidesEl.querySelector('canvas#lineChart')
		let prevChartParent = prevChart.parentNode
		let nextChart =
			swiper.slides[swiper.activeIndex].querySelector('#lineChart')

		let oldChild = nextChart.parentNode.replaceChild(prevChart, nextChart)
		prevChartParent.append(oldChild)

		lineChart.update()
	}

	function createChart() {
		balanceChart = new Chart('balanceChart', {
			type: 'doughnut',
			data: data,
			options: {
				cutout: '35%',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},

					tooltip: {
						callbacks: {
							label: function (context) {
								let labelIndex = context.dataIndex

								if (context.datasetIndex === 1) {
									labelIndex =
										context.chart.data.datasets[0].data.length + labelIndex
								}

								return (
									context.chart.data.labels[labelIndex] +
									': ' +
									context.formattedValue
								)
							},
						},
					},
				},
			},
		})

		lineChart = new Chart('lineChart', {
			type: 'line',
			data: {
				labels: [
					'test',
					'test2',
					'test2',
					'test2',
					'test2',
					'test',
					'test2',
					'test2',
					'test2',
					'test2',
				],
				datasets: [
					{
						label: 'Dataset 1',
						data: [23, 35, 38, 140, 12, 7, 13, 15, 20, 30],
						borderColor: '#F05A22',
						borderWidth: 1,
						pointBackgroundColor: 'transparent',
						pointBorderColor: 'transparent',
						backgroundColor: function (context) {
							const chart = context.chart
							const { ctx, chartArea } = chart

							if (!chartArea) {
								// This case happens on initial chart load
								return
							}

							const chartWidth = chartArea.right - chartArea.left
							const chartHeight = chartArea.bottom - chartArea.top
							if (!gradient || width !== chartWidth || height !== chartHeight) {
								// Create the gradient because this is either the first render
								// or the size of the chart has changed
								width = chartWidth
								height = chartHeight
								gradient = ctx.createLinearGradient(
									0,
									chartArea.bottom,
									0,
									chartArea.top
								)
								gradient.addColorStop(0, 'rgba(255, 178, 108, 0)')
								gradient.addColorStop(1, 'rgba(240, 90, 34, 0.48)')
							}
							return gradient
						},
						fill: true,
					},
					{
						label: 'Dataset 1',
						data: [20, 30, 35, 40, 20, 35, 20, 10, 13, 30],
						borderColor: 'rgba(30, 30, 30, 0.2)',
						borderWidth: 1,
						pointBackgroundColor: 'transparent',
						pointBorderColor: 'transparent',
						stepped: true,
					},
				],
			},
			options: {
				layout: {},
				maintainAspectRatio: false,
				elements: {
					line: {
						tension: 0.5,
					},
				},
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
					},
				},
				plugins: {
					legend: {
						display: false,
					},
				},
			},
		})

		balanceChart.data = createBalanceDataset(categories[0].instruments)
		balanceChart.update()
	}
	function createBalanceDataset(instr) {
		instr = instr
			.filter((item) => item.total != 0 && item.total != null)
			.sort((a, b) => b.total - a.total)

		let plusColors = []
		let plus = instr
			.filter((item) => item.total >= 0)
			.map((item) => {
				// plusColors.push( dashStore.instrColors[inputs.value.category_type + item[0]] )
				return item.total
			})

		let totalPlus = plus.length ? plus.reduce((a, b) => a + b) : 0

		let minusColors = []
		let minus = instr
			.filter((item) => item.total < 0)
			.map((item) => {
				// minusColors.push( dashStore.instrColors[inputs.value.category_type + item[0]] )
				return item.total
			})

		let totalMinus = Math.abs(minus.length ? minus.reduce((a, b) => a + b) : 1)

		let data = {}

		data.labels = instr.map((item) => item.name)
		data.datasets = [
			{
				data: plus,
				// backgroundColor: plusColors,
				hoverOffset: 4,
			},
			{
				data: minus,
				// backgroundColor: minusColors,
				circumference:
					totalPlus == 0 ? 360 : Math.floor((totalMinus / totalPlus) * 360),
			},
		]

		return data
	}
</script>

<style lang="scss" scoped>
	.header {
		color: #747474;
		padding: 0 15px;
		font-weight: 500;
		font-size: 20px;
		margin-bottom: 15px;
	}
	.chart_view {
		font-size: 14px;
	}
	.header_info {
		font-size: 16px;
	}
	.main_chart {
		background: #fff;
		margin: 0 15px;
		padding-top: 9px;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
		margin-bottom: 10px;

		&_h {
			padding: 0 14px;
			padding-bottom: 4px;
			font-size: 14px;
			line-height: 24px;
			color: #747474;
		}
		&_price {
			padding: 0 14px;
			padding-bottom: 50px;
			font-weight: 600;
			font-size: 20px;
			line-height: 24px;
		}
	}
	ion-content {
		--padding-top: 10px;
		--padding-bottom: 10px;
		--background: #fafafa;
	}
	.balance_swiper {
		padding-bottom: 10px;
	}
	.balance_block {
		margin: 0 15px;
		padding: 15px 13px;
		background: #fff;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	.bb_header {
		font-size: 20px;
		line-height: 24px;
		color: #747474;
	}
	.bb_price {
		font-weight: 600;
		font-size: 20px;
		line-height: 24px;
	}
	.bb_header_line {
		margin-bottom: 25px;
	}
	.balance_labels_item {
		padding: 8px 12px;
		padding-right: 4px;
		transition: 0.3s;
		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}
	.balance_labels_percent {
		padding: 3px 9px;
		background: #747474;
		color: #fff;
		border-radius: 5px;
		margin-right: 6px;
	}
	.balance_labels_text {
		font-size: 16px;
		line-height: 24px;
		color: #747474;
	}
	.instr_block {
		padding-left: 0;
		padding-right: 0;
	}
	.instr_block_header {
		padding-left: 13px;
		padding-right: 13px;
		margin-bottom: 0;
	}
	.instr_block_change {
		padding-right: 13px;
	}
	.instruments {
		padding: 5px 13px;
		transition: 0.3s;
		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}
	.instr_first {
		text-align: right;
		width: 85px;
	}
	.instr_second {
		text-align: right;
		width: 40px;
	}
	.instr_pos {
		color: #747474;
		font-size: 14px;
		line-height: 24px;
	}
	.instr_market_value {
		font-weight: 500;
		font-size: 16px;
		line-height: 24px;
	}
	.instr_change_percent {
		font-weight: 600;
		font-size: 12px;
		line-height: 24px;
		color: #747474;

		&.plus {
			color: rgba(52, 199, 89, 1);
		}
		&.minus {
			color: #ff2d55;
		}
		&.neutral {
			color: #747474;
		}
	}
</style>
