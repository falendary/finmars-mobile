<template>

	<div class="history-chart-holder">

		<swiper
			v-if="spaceStore.portfolioList.length"
			:slides-per-view="1.1"
			v-bind="$attrs"
			:pagination="true"
			:modules="[Pagination]"
			:loop="true"
			class="balance_swiper"
			@swiper="onSwiper"
			@slideChangeTransitionEnd="onPortfolioChange"
		>
			<swiper-slide v-for="(item, k) in portfolios" v-bind:key="k">
				<div class="main_chart" v-if="!processing">
					<div class="main_chart_h">
						<h4 style="margin: 0">{{ item.name }}</h4>
						{{ type == 'balance' ? 'Net Asset Value' : 'Profit & Loss' }}
					</div>

					<div class="main_chart_price" v-if="nav !== null">
						{{ $format(portfolios[k].price) }}
						{{ spaceStore.settings.general.currency }}
					</div>
					<div class="main_chart_price" v-else>
						<IonSkeletonText :animated="true" style="width: 30%; height: 24px" />
					</div>

					<div
						style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
						v-show="!error" v-if="chartData"
					>

						<Line :data="chartData.data" :options="chartData.options"></Line>

					</div>
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
	import { computed } from 'vue'
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
			nav: [String, Number],
			type: {
				type: String,
				default: 'balance'
			}
		},
		emits: ['portfolioChange', 'refresher'],
		data() {
			return {
				error: '',
				localChartCache: {},
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
				chartData: null
			}
		},
		methods: {
			async fetchPortfolios() {

				this.portfolios = [];

				// TODO Consider refactor here
				// Some weird logic that I do not like

				this.portfolios = this.spaceStore.settings.general.portfolios.map((o, k) => {

					useApi('reportsSummary.get', {
						filters: {
							portfolios: o,
							currency: this.spaceStore.settings.general.currency,
							date_to: this.spaceStore.settings.general.date_to
						}
					}).then((stats) => {
						if (stats.error) {
							this.portfolios[k].price = '--'
							this.portfolios[k].change.price = '--'
							this.portfolios[k].change.percent = '--'
						}

						this.portfolios[k].price = stats.total.nav
						this.portfolios[k].change.price = stats.total.pl_daily
						this.portfolios[k].change.percent =
							Math.round(stats.total.pl_daily_percent * 100) / 100


						console.log('this.portfolios', this.portfolios);

					})

					return {
						id: o,
						name: o,
						user_code: o,
						price: '-',
						change: {
							price: '-',
							percent: '-'
						}
					}
				})

				console.log('this.portfolios', this.portfolios);

			},
			onSwiper(swiper) {
				let slideIndex = this.spaceStore.portfolioList.findIndex(
					(o) => o.user_code == this.$route.query.tab
				)

				if (slideIndex != -1) {
					swiper.slideTo(slideIndex)
					this.init()
				} else {
					// if no portfolio
					this.$router.push({ query: { tab: this.spaceStore.portfolioList[0].user_code } })
				}
			},
			async refresh(force = false) {

				this.processing = true;

				await this.fetchPortfolios();
				await this.fetchHistory(force)
				await this.createChart()

				this.processing = false;

			},
			async init() {

				this.processing = true;

				await this.fetchPortfolios();
				await this.fetchHistory()
				await this.createChart()

				this.processing = false;

			},
			async createChart() {
				const skipped = (ctx, value) =>
					ctx.p0.skip || ctx.p1.skip ? value : undefined

				const down = (ctx, value) =>
					ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined

				if (this.lineChartObj) this.lineChartObj.destroy()

				let width, height, gradient

				console.log('createChart.type', this.type)
				console.log('createChart.$route.query.tab', this.$route.query.tab)

				let cacheName

				if (this.type == 'balance') {
					cacheName = this.type + this.$route.query.tab + this.date_to
				} else if (this.type == 'pl') {
					cacheName = this.type + this.$route.query.tab + this.date_to + this.date_from
				}


				let chartRef = `${this.type}_line_chart_${this.$route.query.tab}`

				console.log('$refs', this.$refs)
				console.log('this.$refs[chartRef]', this.$refs[chartRef])

				this.chartData = {}

				this.chartData.data = {
					labels: this.localChartCache[cacheName].labels,
					datasets: [
						{
							label: 'Dataset',
							data: this.localChartCache[cacheName].data,
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


				console.log('HistoryChart.chartData', this.chartData);

			},
			async fetchHistory() {
				let filters = {
					portfolio: this.$route.query.tab,
					date_to: this.date_to
				}
				this.error = ''

				if (this.date_from) filters.date_from = this.date_from

				let cacheName

				if (this.type == 'balance') {
					cacheName = this.type + this.$route.query.tab + this.date_to
				} else if (this.type == 'pl') {
					cacheName = this.type + this.$route.query.tab + this.date_to + this.date_from
				}

				console.log('cacheName.cacheName', cacheName)

				const histNav = await useApi('widgetsHistory.get', {
					params: {
						type: this.type === 'balance' ? 'nav' : 'pl'
					},
					provider: null,
					filters
				})

				if (!histNav || histNav.error) {
					this.error = 'No data'
					return false
				}

				let labels = histNav.items.map((o) => o.date)
				let data = histNav.items.map(
					(o) => o[this.type == 'balance' ? 'nav' : 'total']
				)

				if (data[0] === null) {
					labels.unshift('hack')
					data.unshift(0)
				}
				if (data[data.length - 1] === null) {
					labels.push('hack')
					data.push(0)
				}

				this.localChartCache[cacheName] = {
					labels: labels,
					data: data
				}

				console.log('fetchHistory.localChartCache', this.localChartCache);

			},
			onPortfolioChange(swiper) {
				let userCode = this.spaceStore.portfolioList[swiper.realIndex]?.user_code

				this.$router.push({
					query: {
						tab: userCode
					}
				})
			}
		},
		mounted() {

			this.init()

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.spaces[this.store.activeSpaceCode])

			this.$emit('refresher', this.refresh)

		}
	}
</script>

<style lang="scss" scoped>

	.history-chart-holder {
		background: var(--ion-background-color);
		padding: 16px 8px 8px;
	}

	.main_chart {
		background: var(--ion-pane-background);
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
