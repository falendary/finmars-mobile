<template>

	<div class="history-chart-holder" v-if="activePortfolio">

		<swiper
			:slides-per-view="1.1"
			v-bind="$attrs"
			:pagination="true"
			:modules="[Pagination]"
			:loop="true"
			class="balance_swiper"
			@swiper="onSwiper"
			@slideChange="onSlideChange"
		>
			<swiper-slide v-for="(item, k) in spaceStore.settings.general.portfolios" v-bind:key="k">
				<div class="main_chart" v-if="!processing">
					<div class="main_chart_h">
						<h4 style="margin: 0">{{ item }}</h4>
						{{ type == 'balance' ? 'Net Asset Value' : 'Profit & Loss' }}
					</div>

					<div class="main_chart_price">
						{{ $format(targetValue) }}
						{{ spaceStore.settings.general.currency }}
					</div>

					<div
						style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
						v-show="!error" v-if="!chartProcessing && item === activePortfolio"
					>

<!--						<Line :data="chartData.data" :options="chartData.options"></Line>-->

					</div>
					<div
						style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
						v-show="!error" v-if="!chartProcessing && item !== activePortfolio"
					>


					</div>
					<IonSkeletonText v-if="chartProcessing && !error"
													 :animated="true"
													 style="width: 100%; height: 80px; margin-bottom: -5px"
					/>
					<div
						class="center aic"
						style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
						v-show="error"
					>
						{{ error }}
					</div>
				</div>


				<div class="main_chart" v-if="processing">
					<div class="main_chart_h">
						<IonSkeletonText :animated="true" style="width: 40%; height: 24px" />
						{{ type == 'balance' ? 'Net Asset Value' : 'Profit & Loss' }}
					</div>
					<div class="main_chart_price">
						<IonSkeletonText :animated="true" style="width: 60%; height: 24px" />
					</div>

					<IonSkeletonText
						:animated="true"
						style="width: 100%; height: 80px; margin-bottom: -5px"
					/>
				</div>

			</swiper-slide>
		</swiper>


	</div>
</template>

<script>
	import { computed, watch } from 'vue'
	import { IonSkeletonText } from '@ionic/vue'
	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { Pagination } from 'swiper'
	import useApi from '@/composables/useApi'
	import useStore from '@/composables/useStore'
	import { Line } from 'vue-chartjs'

	export default {
		name: 'HistoryChart',
		components: {
			IonSkeletonText,
			Swiper,
			SwiperSlide,
			Pagination,
			Line
		},
		props: {
			portfolio: String,
			date_to: String,
			date_from: String,
			currency: String,
			type: {
				type: String,
				default: 'balance'
			}
		},
		emits: ['portfolioChange', 'refresher'],
		data() {
			return {
				error: '',
				cacheData: {},
				histNav: null,
				lineChartObj: null,
				width: null,
				height: null,
				gradient: null,
				Pagination: Pagination,
				store: null,
				spaceStore: null,
				portfolios: [],
				processing: false,
				chartProcessing: false,
				chartData: null,
				activePortfolio: null,
				targetValue: 0
			}
		},
		methods: {

			onSwiper(swiper) {

				let slideIndex = this.spaceStore.settings.general.portfolios.findIndex(
					(o) => o == this.activePortfolio
				)

				if (slideIndex != -1) {
					swiper.slideTo(slideIndex)
					this.init()
				}
			},
			async reloadChart() {

				try {
					this.chartProcessing = true
					await this.fetchPerformance()
					await this.createChart()
					this.chartProcessing = false
				} catch (error) {
					console.error('Could not create history chart', error)
				}

			},
			async refresh() {

				console.log("HISTORY_CHART: refreshing")

				this.processing = true

				this.cacheData = {} // clear cache

				await this.fetchNavOrTotal()
				await this.reloadChart()

				this.processing = false

			},
			async init() {

				this.activePortfolio = this.$route.query.tab

				this.processing = true

				await this.fetchNavOrTotal()
				await this.reloadChart()

				this.processing = false

			},
			async createChart() {
				const skipped = (ctx, value) =>
					ctx.p0.skip || ctx.p1.skip ? value : undefined

				const down = (ctx, value) =>
					ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined

				if (this.lineChartObj) this.lineChartObj.destroy()

				let width, height, gradient

				console.log('createChart.type', this.type)
				console.log('createChart.activePortfolio', this.activePortfolio)

				let labels = []
				let data = []
				let cashflowData = []

				this.cacheData[this.activePortfolio].items.forEach((item) => {

					labels.push(item.date_to)

					if (this.type === 'balance') {
						data.push(item.nav)
					} else {
						data.push(item.cumulative_return)
					}

					cashflowData.push(item.cash_flow)

				})

				// console.log('data', data);

				this.chartData = {}

				this.chartData.data = {
					labels: labels,
					datasets: [
						{
							label: 'Dataset',
							data: data,
							borderColor: '#F05A22',
							borderWidth: 1,
							pointBackgroundColor: 'transparent',
							pointBorderColor: 'transparent',
							backgroundColor: function(context) {
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
							segment: {
								borderColor: (ctx) =>
									skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
								borderDash: (ctx) => skipped(ctx, [6, 6]),
								backgroundColor: (ctx) => skipped(ctx, 'rgb(0,0,0,0.1)')
							},
							spanGaps: true
						}
						// {
						// 	label: 'Dataset',
						// 	data: cashflowData,
						// 	borderColor: '#F05A22',
						// 	borderWidth: 1,
						// 	pointBackgroundColor: 'transparent',
						// 	pointBorderColor: 'transparent',
						// 	spanGaps: true
						// }
					]
				}

				this.chartData.options = {
					layout: {},
					maintainAspectRatio: false,
					elements: {
						line: {
							tension: 0.5
						}
					},
					scales: {
						x: {
							display: false
						},
						y: {
							display: false
						}
					},
					plugins: {
						legend: {
							display: false
						}
					}
				}


				console.log('HistoryChart.chartData', this.chartData)

			},

			async fetchBalanceReport() {
				let filters = []

				let res = await useApi('backendBalanceReportGroups.post', {
					body: {
						account_mode: this.spaceStore.settings.balance.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
						accounts: [],
						accounts_cash: [],
						accounts_position: [],
						allocation_detailing: true,
						allocation_mode: 0,
						approach_multiplier: 0.5,
						calculate_pl: true,
						calculationGroup: 'portfolio',
						cost_method: 1,
						custom_fields_to_calculate: '',
						expression_iterations_count: 1,
						filters,
						frontend_request_options: {
							columns: [
								{
									'key': 'portfolio.user_code',
									'value_type': 10
								},
								{
									'key': 'market_value',
									'report_settings': {
										'subtotal_formula_id': 1 // sum
									},
									'value_type': 20
								}
							],
							groups_types: [
								{
									'key': 'portfolio.user_code',
									'value_type': 10
								}
							],
							page: 1,
							filter_settings: []
						},
						pl_include_zero: false,
						portfolio_mode: 1,
						portfolios: [this.$route.query.tab],
						pricing_policy: this.spaceStore.settings.general.pricing_policy,
						report_currency: this.spaceStore.settings.general.currency,
						report_date: this.spaceStore.settings.general.date_to,
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
						task_id: null
					}
				})

				this.targetValue = res.items[0].subtotal.market_value

				return res
			},
			async fetchPLReport() {
				let filters = []

				let res = await useApi('backendBalanceReportGroups.post', {
					body: {
						account_mode: this.spaceStore.settings.balance.consolidateAccounts ? 0 : 1, // 0 - ignore, 1 - independent
						accounts: [],
						accounts_cash: [],
						accounts_position: [],
						allocation_detailing: true,
						allocation_mode: 0,
						approach_multiplier: 0.5,
						calculate_pl: true,
						calculationGroup: 'portfolio',
						cost_method: 1,
						custom_fields_to_calculate: '',
						expression_iterations_count: 1,
						filters,
						frontend_request_options: {
							columns: [
								{
									'key': this.spaceStore.settings.balance.groupByKey,
									'value_type': 10
								},
								{
									'key': this.spaceStore.settings.balance.sumByKey,
									'report_settings': {
										'subtotal_formula_id': 1 // sum
									},
									'value_type': 20
								}
							],
							groups_types: [
								{
									'key': this.spaceStore.settings.balance.groupByKey,
									'value_type': 10
								}
							],
							page: 1,
							filter_settings: []
						},
						pl_include_zero: false,
						portfolio_mode: 1,
						portfolios: [this.$route.query.tab],
						pricing_policy: this.spaceStore.settings.general.pricing_policy,
						report_currency: this.spaceStore.settings.general.currency,
						report_date: this.spaceStore.settings.general.date_to,
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
						task_id: null
					}
				})

				return res
			},
			async fetchNavOrTotal() {

				this.targetValue = 0;

				if (this.type === 'balance') {
					await this.fetchBalanceReport();
				}  else {
					await this.fetchPLReport();
				}


			},
			async fetchPerformance() {

				let performanceData

				console.log('this.spaceStore.settings', this.spaceStore.settings)

				let activePortfolioObject = null

				this.spaceStore.portfolios.forEach((item) => {

					if (item.user_code == this.activePortfolio) {
						activePortfolioObject = item
					}

				})

				if (this.cacheData.hasOwnProperty(this.activePortfolio)) {
					return
				}

				try {

					performanceData = await useApi('performanceReport.post', {
						body: {
							begin_date: activePortfolioObject.first_transaction.date,
							end_date: this.spaceStore.settings.general.date_to,
							calculation_type: 'modified_dietz',
							segmentation_type: 'months',
							registers: [this.activePortfolio],
							report_currency: this.spaceStore.settings.general.currency
						}
					})

				} catch (e) {
					this.error = 'No data'
					return false
				}

				console.log('performanceData', performanceData)

				this.cacheData[this.activePortfolio] = performanceData


			},
			async onSlideChange(swiper) {

				let userCode = this.spaceStore.settings.general.portfolios[swiper.realIndex]

				console.log('onPortfolioChange.userCode', userCode)

				this.activePortfolio = userCode

				this.$emit('portfolioChange', {
					activePortfolio: this.activePortfolio
				})

				await this.refresh()

			}
		},
		mounted() {

			this.init()

		},
		async created() {

			this.store = useStore()
			this.spaceStore = this.store.activeSpaceStore

			this.$emit('refresher', this.refresh)


		}
	}
</script>

<style lang="scss" scoped>

	.history-chart-holder {
		background: var(--ion-pane-background);
		padding: 16px 8px 8px;
	}

	.main_chart {
		background: var(--ion-card-background);
		//margin: 0 8px;
		margin: 0 4px;
		padding-top: 9px;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);

		&_h {
			padding: 0 14px;
			padding-bottom: 4px;
			font-size: 14px;
			line-height: 24px;
			color: #747474;
		}

		&_price {
			padding: 0 14px;
			padding-bottom: 25px;
			font-weight: 600;
			font-size: 20px;
			line-height: 24px;
		}
	}
</style>
