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
							<canvas v-if="'asset_types' == k" id="lineChart"
								><p>Chart</p></canvas
							>
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
							<div class="bb_price">
								{{ $format(Math.floor(item.agr_market_value)) }} USD
							</div>
						</div>

						<div class="flex sb">
							<div
								class="balance_chart_wrap"
								style="width: 145px; height: 145px"
								v-show="isChartView"
							>
								<canvas v-if="'asset_types' == k" id="balanceChart"
									><p>Chart</p></canvas
								>
								<div v-else id="balanceChart"></div>
							</div>

							<div class="balance_labels">
								<div
									class="balance_labels_item flex aic"
									v-for="subcat in item.items"
									:class="{ active: detailSubcat.name == subcat.name }"
									@click="detailSubcat = JSON.parse(JSON.stringify(subcat))"
								>
									<div
										class="balance_labels_percent"
										:style="{ backgroundColor: colorByCat(subcat.name) }"
									>
										{{
											Math.round(
												(subcat.agr_market_value /
													Math.abs(item.agr_market_value)) *
													100
											)
										}}%
									</div>
									<div class="balance_labels_text">{{ subcat.name }}</div>
								</div>
							</div>

							<div v-show="!isChartView"></div>
						</div>
					</div>
				</swiper-slide>
			</swiper>

			<template v-if="detailSubcat.name">
				<div class="header flex aic sb">Details</div>

				<div class="balance_block instr_block">
					<div class="bb_header_line instr_block_header flex sb aifs">
						<div class="bb_header">{{ detailSubcat.name }}</div>
						<div>
							<div class="bb_price">
								{{ $format(detailSubcat.agr_market_value) }} USD
							</div>
							<div class="instr_block_change flex jcfe">
								<div class="instr_change_percent instr_first minus">
									{{ $format(1254) }}
								</div>
								<div class="instr_change_percent instr_second plus">YTD</div>
							</div>
						</div>
					</div>

					<div
						class="instruments"
						v-for="item in detailSubcat.items"
						:class="{ active: activeInstrumentUserCode == item.user_code }"
						@click="activeInstrumentUserCode = item.user_code"
					>
						<div class="flex sb jcfe">
							<div class="instr_name">
								{{
									item.name.length > 20
										? item.name.slice(0, 20) + '...'
										: item.name
								}}
							</div>
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
							<div class="instr_pos">{{ $format(item.position_size) }}</div>

							<div class="flex">
								<div
									class="instr_change_percent instr_first"
									:class="[item.change.value > 0 ? 'plus' : 'minus']"
								>
									{{ $format(item.change.value) }}
								</div>
								<div
									class="instr_change_percent instr_second"
									:class="[item.change.value > 0 ? 'plus' : 'minus']"
								>
									YTD
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<template v-if="activeInstrumentUserCode">
				<div class="header flex aic sb">Transactions</div>

				<TransactionList
					:options="{
						end_date: '2022-09-19',
						begin_date: '0001-01-01',
						filter_entry_user_code: [activeInstrumentUserCode],
					}"
				/>
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import { onMounted, ref, reactive } from 'vue'

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
	let detailSubcat = ref({})
	let activeInstrumentUserCode = ref(null)

	let categories = reactive({
		asset_types: {
			name: 'Asset type',
			agr_market_value: 0,
			items: [],
		},
		currency: {
			name: 'Currency',
			agr_market_value: 0,
			items: [],
		},
	})
	let colors = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
	]
	let colorsCat = {}
	let histNav = []

	onMounted(async () => {
		histNav = await useApi('widgetsHistory.get', {
			params: {
				type: 'nav',
			},
			provider: null,
			filters: {
				portfolio: 2,
				date_to: '2022-09-19',
				date_from: '2020-09-19',
			},
		})
		console.log('histNav:', histNav)

		let [report, reportYTD] = await Promise.all([
			fetchReport({ date: '2022-09-19' }),
			fetchReport({ date: '2022-01-01' }),
		])

		let _cats = {
			asset_types: {
				agr_market_value: 0,
				name: 'Asset type',
				items: {},
			},
			currency: {
				agr_market_value: 0,
				name: 'Currency',
				items: {},
			},
		}
		let calcValueYTD = (instrId) => {
			let instr = reportYTD.items.find((o) => o.id == instrId)

			if (!instr) return 0
			if (instr.market_value === null) return '-'

			return instr.market_value
		}
		let calcChangeObj = (instr) => {
			let market_value_ytd = calcValueYTD(instr.id)

			let change_val = '-'
			let percent = '-'

			if (instr.market_value != '-' && market_value_ytd != '-') {
				change_val = instr.market_value - market_value_ytd
				percent = Math.round((change_val / Math.abs(instr.market_value)) * 100)
			}

			return {
				value: change_val,
				percent: percent,
			}
		}
		report.items.forEach((item, key) => {
			// Currency
			_cats.currency.agr_market_value += item.market_value

			let newItem = {
				id: item.id,
				name: item.name,
				user_code: item.user_code,
				market_value: item.market_value === null ? '-' : item.market_value,
				position_size: item.position_size,
				change: calcChangeObj(item),
			}

			if (item.item_type == 2) {
				let key = report.item_currencies.find(
					(o) => o.id == item.currency
				)?.short_name

				if (!_cats.currency.items[key]) {
					_cats.currency.items[key] = {
						items: [],
						agr_market_value: 0,
					}
				}

				_cats.currency.items[key].agr_market_value += item.market_value
				_cats.currency.items[key].items.push(newItem)
			}

			if (item.item_type == 1) {
				let instr_obj = report.item_instruments.find(
					(o) => o.id == item.instrument
				)

				let key = report.item_currencies.find(
					(o) => o.id == instr_obj.pricing_currency
				)?.short_name

				if (!_cats.currency.items[key]) {
					_cats.currency.items[key] = {
						items: [],
						agr_market_value: 0,
					}
				}

				_cats.currency.items[key].agr_market_value += item.market_value
				_cats.currency.items[key].items.push(newItem)
			}
			// Asset types
			_cats.asset_types.agr_market_value += item.market_value

			if (!_cats.asset_types.items[item.custom_fields[0].value]) {
				_cats.asset_types.items[item.custom_fields[0].value] = {
					items: [],
					agr_market_value: 0,
				}
			}

			_cats.asset_types.items[item.custom_fields[0].value].agr_market_value +=
				item.market_value

			_cats.asset_types.items[item.custom_fields[0].value].items.push(newItem)
		})

		for (let prop in _cats) {
			let colorKey = 0

			categories[prop].agr_market_value = _cats[prop].agr_market_value

			for (let instr in _cats[prop].items) {
				categories[prop].items.push({
					..._cats[prop].items[instr],
					name: instr,
					items: _cats[prop].items[instr].items.sort((a, b) => {
						if (b.change.percent == '-') return -1
						return b.change.percent - a.change.percent
					}),
				})

				colorsCat[instr] = colors[colorKey]
				++colorKey
			}
			categories[prop].items = categories[prop].items
				.filter((o) => o.agr_market_value != 0)
				.sort((a, b) => b.agr_market_value - a.agr_market_value)
		}

		createChart()
	})

	async function fetchReport(opts) {
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
				allocation_mode: 0,
				approach_multiplier: 0.5,
				calculate_pl: true,
				calculationGroup: 'portfolio',
				complex_transaction_statuses_filter: 'booked',
				cost_method: 1,
				cost_method_object: {
					id: 1,
					user_code: 'AVCO',
					name: 'AVCO',
					description: 'AVCO',
				},
				custom_fields_to_calculate: 'Asset Types',
				date_field: 'transaction_date',
				depth_level: 'base_transaction',
				expression_iterations_count: 1,
				filters: [
					{
						content_type: 'portfolios.portfolio',
						filtersListIndex: 0,
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
						custom_field: {
							expr: "iff(item_type_name=='Currency', 'Cash and equivalents', instrument.attributes.asset_types)",
							name: 'Asset Types',
							notes: '',
							user_code: 'asset_types',
							value_type: 10,
						},
						expr: "iff(item_type_name=='Currency', 'Cash and equivalents', instrument.attributes.asset_types)",
						filtersListIndex: 3,
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
				],
				pl_include_zero: false,
				portfolio_mode: 1,
				portfolios: [],
				portfolios_object: [],
				pricing_policy: 1,
				pricing_policy_object: {
					id: 1,
					user_code: '-',
					name: '-',
					short_name: '-',
					notes: null,
					expr: '(ask+bid)/2',
					deleted_user_code: null,
					meta: {
						content_type: 'instruments.pricingpolicy',
						app_label: 'instruments',
						model_name: 'pricingpolicy',
						space_code: 'space0crgw',
					},
				},
				report_currency: 2,
				report_currency_object: {
					id: 2,
					user_code: 'USD',
					name: 'USD - United States Dollar',
					short_name: 'USD',
					deleted_user_code: null,
					meta: {
						content_type: 'currencies.currency',
						app_label: 'currencies',
						model_name: 'currency',
						space_code: 'space0crgw',
					},
				},
				report_date: opts.date,
				report_type: 1,
				show_balance_exposure_details: false,
				show_transaction_details: true,
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
				pl_first_date: null,
				task_id: null,
			},
		})

		return res
	}

	function onBalanceChange(swiper) {
		let prevChart = swiper.slidesEl.querySelector('canvas#balanceChart')
		let prevChartParent = prevChart.parentNode
		let nextChart =
			swiper.slides[swiper.activeIndex].querySelector('#balanceChart')
		let oldChild = nextChart.parentNode.replaceChild(prevChart, nextChart)
		prevChartParent.append(oldChild)

		let cat = categories[Object.keys(categories)[swiper.realIndex]]
		balanceChart.data = createBalanceDataset(cat)
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
				labels: histNav.items.map((o, k) => k),
				datasets: [
					{
						label: 'Dataset 1',
						data: histNav.items.map((o) => o.nav),
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

		balanceChart.data = createBalanceDataset(categories.asset_types)
		balanceChart.update()
		lineChart.update()
	}

	function colorByCat(item) {
		return colorsCat[item]
	}
	function createBalanceDataset(cat) {
		let plusColors = []
		let plus = cat.items
			.filter((item) => item.agr_market_value >= 0)
			.map((item, k) => {
				plusColors.push(colorByCat(item.name))
				return item.agr_market_value
			})

		let totalPlus = plus.length ? plus.reduce((a, b) => a + b) : 0

		let minusColors = []
		let minus = cat.items
			.filter((item) => item.agr_market_value < 0)
			.map((item, k) => {
				minusColors.push(colorByCat(item.name))

				return item.agr_market_value
			})

		let totalMinus = Math.abs(minus.length ? minus.reduce((a, b) => a + b) : 1)

		let data = {}

		data.labels = cat.items.map((item) => item.name)
		data.datasets = [
			{
				data: plus,
				backgroundColor: plusColors,
				hoverOffset: 4,
			},
			{
				data: minus,
				backgroundColor: minusColors,
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
	.balance_chart_wrap {
		flex-shrink: 0;
	}
	.balance_block {
		margin: 0 15px;
		padding: 15px 13px;
		background: #fff;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	.bb_header {
		font-size: 18px;
		line-height: 22px;
		color: #747474;
		width: 50%;
	}
	.bb_price {
		font-weight: 600;
		font-size: 18px;
		line-height: 22px;
		text-align: right;
	}
	.bb_header_line {
		margin-bottom: 25px;
	}
	.balance_labels {
		margin-left: 10px;
		width: 100%;
	}
	.balance_labels_item {
		padding: 6px 8px;
		padding-right: 4px;
		transition: 0.3s;
		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}
	.balance_labels_percent {
		padding: 3px 0;
		background: #747474;
		flex-shrink: 0;
		color: #fff;
		font-size: 14px;
		width: 50px;
		text-align: center;
		border-radius: 5px;
		margin-right: 6px;
	}
	.balance_labels_text {
		font-size: 14px;
		line-height: 16px;
		color: #747474;
	}
	.instr_block {
		padding-left: 0;
		padding-right: 0;
	}
	.instr_block_header {
		padding-left: 13px;
		padding-right: 13px;
		margin-bottom: 10px;
	}
	.instr_block_change {
	}
	.instruments {
		padding: 5px 13px;
		transition: 0.3s;
		&.active {
			background: rgba(255, 138, 0, 0.2);
		}
	}
	.instr_name {
		line-height: 20px;
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
		line-height: 20px;
	}
	.instr_change_percent {
		font-weight: 600;
		font-size: 12px;
		line-height: 20px;
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
