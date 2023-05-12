<template>
	<ion-page>
		<ion-content>
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="header flex sb aic">
				<div v-if="activePortfolioName">{{ activePortfolioName }}</div>
				<IonSkeletonText
					v-else
					:animated="true"
					style="height: 24px; width: 80px"
				/>

				<div class="header_info">
					{{ dayjs(store.settings.balance.date).format('DD MMM YYYY') }}
				</div>
			</div>

			<HistoryChartComp
				:date_to="store.settings.balance.date"
				:currency="store.settings.balance.currency"
				@portfolioChange="init($event)"
			/>

			<IndicatorsComp
				:portfolio_id="activePortfolio"
				:currency="store.settings.balance.currency"
				:date="store.settings.balance.date"
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
				v-if="categories.asset_types"
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
								{{ $format(Math.floor(item.market_value)) }}
								{{ store.settings.balance.currency }}
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
									@click="
										;(detailSubcat = subcat),
											(transactionsOpts.filter_entry_user_code = null)
									"
								>
									<div
										class="balance_labels_percent"
										:style="{ backgroundColor: colorByCat(subcat.name) }"
									>
										{{
											Math.round(
												(subcat.market_value / Math.abs(item.market_value)) *
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
								{{ $format(detailSubcat.agr_market_value) }}
								{{ store.settings.balance.currency }}
							</div>
							<!-- <div class="instr_block_change flex jcfe">
								<div class="instr_change_percent instr_first minus">
									{{ $format(1254) }}
								</div>
								<div class="instr_change_percent instr_second plus">YTD</div>
							</div> -->
						</div>
					</div>

					<div
						class="instruments"
						v-for="item in detailSubcat.items"
						:class="{
							active: transactionsOpts.filter_entry_user_code == item.user_code,
						}"
						@click="transactionsOpts.filter_entry_user_code = item.user_code"
					>
						<div class="flex sb jcfe">
							<div class="instr_name">
								{{
									item.name.length > 20
										? item.name.slice(0, 20) + '...'
										: item.name
								}}
							</div>
							<div class="instr_market_value instr_first">
								{{ $format(item.market_value) }}
							</div>
						</div>
						<div class="flex sb">
							<div class="instr_pos">{{ $format(item.position_size) }}</div>

							<div class="flex">
								<div class="instr_change_percent instr_first">
									{{ $format(item.change.value) }}
								</div>
								<div
									class="instr_change_percent instr_second"
									:class="[item.change.percent > 0 ? 'plus' : 'minus']"
								>
									{{ item.change.percent }}%
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<template v-if="transactionsOpts.filter_entry_user_code">
				<div class="header flex aic sb">Transactions</div>

				<TransactionListComp :options="transactionsOpts" />
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import { onMounted, ref, reactive, watch, computed, nextTick } from 'vue'

	import dayjs from 'dayjs'
	import {
		IonCheckbox,
		IonSkeletonText,
		IonRefresher,
		IonRefresherContent,
	} from '@ionic/vue'
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

	import IndicatorsComp from '@/components/Indicators.vue'
	import HistoryChartComp from '@/components/HistoryChart.vue'
	import TransactionListComp from '@/components/TransactionList.vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { Pagination } from 'swiper'
	import { useRoute, useRouter } from 'vue-router'

	import useApi from '@/composables/useApi'
	import useMiniStore from '@/composables/useMiniStore'
	import { reportGroup } from '@/data-utils/reportAggs'

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

	const store = useMiniStore()
	const router = useRouter()
	const route = useRoute()

	let portfolioUserCode = route.query.tab
	const activePortfolio = computed(() => {
		return route.query.tab
	})
	const activePortfolioName = computed(() => {
		return store.portfolioList.find((o) => o.user_code == activePortfolio.value)
			?.name
	})
	const transactionsOpts = reactive({
		end_date: store.settings.balance.date,
		begin_date: '0001-01-01',
		portfolios: portfolioUserCode,
		filter_entry_user_code: null,
	})

	async function refresh(event) {
		await init()

		if (event) event.target.complete()
	}

	if (store.portfolioList.length && !activePortfolio.value)
		router.push({
			query: {
				tab: store.portfolioList[0]?.user_code,
			},
		})
	else if (!activePortfolio.value) {
		watch(
			() => store.portfolioList,
			(n, o, unwatch) => {
				router.push({
					query: {
						tab: store.portfolioList[0]?.user_code,
					},
				})

				unwatch()
			}
		)
	}
	watch(store.settings.balance, () => {
		init()
	})

	let balanceChartObj

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

	let categories = ref({})

	let colorsCat = {}

	init()

	async function init(tab) {
		if (tab == portfolioUserCode) return false
		if (tab) portfolioUserCode = tab

		detailSubcat.value = {}
		transactionsOpts.end_date = store.settings.balance.date
		transactionsOpts.portfolios = portfolioUserCode
		transactionsOpts.filter_entry_user_code = null

		let report = await fetchReport()
		console.log('report:', report)
		categories.value = reportGroup({
			report,
			sum_field: 'market_value',
			colorsCat,
		})
		await nextTick()
		if (!balanceChartObj) createChart()

		balanceChartObj.data = createBalanceDataset(categories.value.asset_types)
		balanceChartObj.update()
	}

	onMounted(() => {})

	async function fetchReport() {
		let res = await useApi('balanceReport.post', {
			body: {
				account_mode: 0,
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
				portfolios: [portfolioUserCode],
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
				report_currency: store.settings.balance.currency,
				report_date: store.settings.balance.date,
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

		let cat = categories.value[Object.keys(categories.value)[swiper.realIndex]]
		balanceChartObj.data = createBalanceDataset(cat)
		balanceChartObj.update()
	}

	function createChart() {
		balanceChartObj = new Chart('balanceChart', {
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
	}

	function colorByCat(item) {
		return colorsCat[item]
	}
	function createBalanceDataset(cat) {
		let plusColors = []
		let plus = cat.items
			.filter((item) => item.market_value >= 0)
			.map((item, k) => {
				plusColors.push(colorByCat(item.name))
				return item.market_value
			})

		let totalPlus = plus.length ? plus.reduce((a, b) => a + b) : 0

		let minusColors = []
		let minus = cat.items
			.filter((item) => item.market_value < 0)
			.map((item, k) => {
				minusColors.push(colorByCat(item.name))

				return item.market_value
			})

		let totalMinus = Math.abs(minus.length ? minus.reduce((a, b) => a + b) : 1)

		let data = {}

		data.labels = cat.items.map((item) => item.name)
		data.datasets = [
			{
				data: plus,
				backgroundColor: plusColors,
				hoverOffset: 4,
				circumference:
					totalPlus >= totalMinus
						? 360
						: Math.floor((totalPlus / totalMinus) * 360),
			},
			{
				data: minus,
				backgroundColor: minusColors,
				circumference:
					totalMinus >= totalPlus
						? 360
						: Math.floor((totalMinus / totalPlus) * 360),
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
		width: 47px;
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
