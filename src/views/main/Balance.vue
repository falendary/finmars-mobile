<template>
	<ion-page>
		<ion-content>
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="header flex sb aic">
				<div v-if="portfolio">{{ portfolio.name }}</div>
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
				@refresher="portfoliosRefresher = $event"
				:nav="total_nav"
			/>

			<IndicatorsComp
				:portfolioId="route.query.tab"
				:currency="store.settings.balance.currency"
				:date="store.settings.balance.date"
				@refresher="indicatorsRefresher = $event"
				@nav="total_nav = $event"
			/>

			<div class="header flex aic sb">
				Balance

				<ion-checkbox
					v-model="isChartView"
					labelPlacement="start"
					class="chart_view"
				>
					Chart view
				</ion-checkbox>
			</div>

			<swiper
				v-if="categories.asset_types"
				:pagination="true"
				:modules="[Pagination]"
				class=""
				:loop="true"
				@slideChangeTransitionEnd="onBalanceChange"
				@swiper="onSwiper"
			>
				<swiper-slide v-for="(item, cat) in categories">
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
								v-show="isChartView && !chartProcced"
							>
								<canvas :id="`${cat}_balanceChart`"><p>Chart</p></canvas>
							</div>

							<ion-skeleton-text
								v-if="chartProcced"
								class="balance_chart_wrap balance_chart_wrap_skeleton"
								:animated="true"
								style="width: 145px; height: 145px"
							/>

							<div
								class="balance_labels"
								:style="!isChartView ? 'margin-left: 0;' : ''"
							>
								<div
									class="balance_labels_item flex aic sb"
									v-for="subcat in item.items"
									:class="{ active: detailSubcat.name == subcat.name }"
									@click="
										;(detailSubcat = subcat), (isOpenTransactions = false)
									"
								>
									<div class="flex aic">
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

									<div class="balance_labels_price" v-show="!isChartView">
										{{ $format(subcat.market_value) }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</swiper-slide>
			</swiper>

			<div
				class="balance_block tac"
				v-else-if="!categories.asset_types && !chartProcced"
			>
				No data
			</div>

			<div v-else class="balance_block">
				<div class="bb_header_line flex sb aic">
					<div class="bb_header">
						<IonSkeletonText
							style="height: 22px; width: 100px"
							:animated="true"
						/>
					</div>
					<div class="bb_price">
						<IonSkeletonText
							style="height: 22px; width: 120px"
							:animated="true"
						/>
					</div>
				</div>

				<div class="flex sb">
					<ion-skeleton-text
						class="balance_chart_wrap balance_chart_wrap_skeleton"
						:animated="true"
						style="width: 145px; height: 145px"
					/>

					<div class="balance_labels">
						<div
							class="balance_labels_item flex aic"
							v-for="subcat in [3, 3, 3]"
						>
							<IonSkeletonText style="height: 32px" :animated="true" />
						</div>
					</div>
				</div>
			</div>

			<template v-if="detailSubcat.name">
				<div class="header flex aic sb">Details</div>

				<div class="balance_block instr_block">
					<div class="bb_header_line instr_block_header flex sb aifs">
						<div class="bb_header">{{ detailSubcat.name }}</div>
						<div>
							<div class="bb_price">
								{{ $format(detailSubcat.market_value) }}
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
						@click="
							;(transactionsOpts.filter_entry_user_code = item.user_code),
								(isOpenTransactions = true)
						"
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

							<div class="flex" v-if="item.item_type != 2">
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

			<template v-if="isOpenTransactions">
				<div class="header flex aic sb">Transactions</div>

				<TransactionListComp
					v-if="transactionsOpts.filter_entry_user_code"
					:options="transactionsOpts"
				/>
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
	const route = useRoute()

	const portfolio = computed(() => {
		return store.portfolioList.find((o) => o.user_code == route.query.tab)
	})

	let total_nav = ref(null)
	const transactionsOpts = reactive({
		end_date: store.settings.balance.date,
		begin_date: '0001-01-01',
		portfolios: route.query.tab,
		filter_entry_user_code: null,
	})
	let isOpenTransactions = ref(false)

	let balanceChartObj
	let chartProcced = ref(false)

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

	let indicatorsRefresher = null
	let portfoliosRefresher = null

	if (route.query.tab) init()

	// This function is init balanceChart
	const onSwiper = (swiper) => {
		createChart()

		balanceChartObj.data = createBalanceDataset(categories.value.asset_types)
		balanceChartObj.update()
	}

	watch(
		() => route.query.tab,
		(newVal, oldVal) => {
			if (!route.path.includes('/main/balance') || newVal == oldVal)
				return false

			total_nav.value = null
			Promise.all([init(), portfoliosRefresher(), indicatorsRefresher()])
		}
	)
	watch(store.settings.balance, () => {
		init()
	})

	async function refresh(event) {
		await Promise.all([
			init(),
			portfoliosRefresher(true),
			indicatorsRefresher(),
		])

		if (event) event.target.complete()
	}

	async function init() {
		chartProcced.value = true
		detailSubcat.value = {}

		transactionsOpts.end_date = store.settings.balance.date
		transactionsOpts.portfolios = route.query.tab
		transactionsOpts.filter_entry_user_code = null

		let report = await fetchReport()

		if (report && !report.error) {
			categories.value = reportGroup({
				report,
				sum_field: 'market_value',
				colorsCat,
			})
		} else {
		}

		chartProcced.value = false
	}

	async function fetchReport() {
		let res = await useApi('balanceReport.post', {
			body: {
				account_mode: 0,
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
				portfolios: [route.query.tab],
				pricing_policy: 1,
				report_currency: store.settings.balance.currency,
				report_date: store.settings.balance.date,
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
				pl_first_date: null,
				task_id: null,
			},
		})

		return res
	}

	function onBalanceChange(swiper) {
		let catName = Object.keys(categories.value)[swiper.realIndex]
		let cat = categories.value[catName]

		createChart(catName)

		balanceChartObj.data = createBalanceDataset(cat)
		balanceChartObj.update()
	}

	function createChart(cat) {
		if (balanceChartObj) balanceChartObj.destroy()

		balanceChartObj = new Chart((cat || 'asset_types') + '_balanceChart', {
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
		--padding-bottom: 20px;
		--background: #fafafa;
	}
	ion-skeleton-text {
		margin: 0;
	}
	.balance_chart_wrap_skeleton {
		border-radius: 50%;
		--background: rgba(255, 138, 0, 0.2);
		--background-rgb: 255, 138, 0;
	}
	.balance_swiper {
		padding-bottom: 10px;
	}
	.balance_chart_wrap {
		flex-shrink: 0;
	}
	.balance_block {
		margin: 0 15px;
		padding: 15px 13px 12px;
		background: #fff;
		border-radius: 5px;
	}
	.instr_block {
		margin-bottom: 10px;
	}
	.swiper-slide .balance_block {
		height: 100%;
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
	.balance_labels_price {
		font-weight: 500;
		font-size: 16px;
		line-height: 22px;
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
