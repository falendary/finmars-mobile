<template>

	<div class="history-chart-holder" v-if="activePortfolio">

		<swiper
			v-if="spaceStore.portfolioList.length"
			:slides-per-view="1.1"
			v-bind="$attrs"
			:pagination="true"
			:modules="[Pagination]"
			:loop="true"
			class="balance_swiper"
			@swiper="onSwiper"
			@slideChange="onSlideChange"
		>
			<swiper-slide v-for="(item, k) in spaceStore.data.portfolios" v-bind:key="k">
				<div class="main_chart" v-if="!processing">
					<div class="main_chart_h">
						<h4 style="margin: 0">{{ item.name }}</h4>
						{{ type == 'balance' ? 'Net Asset Value' : 'Profit & Loss' }}
					</div>

					<div class="main_chart_price">
						<span v-if="type == 'balance'">{{ $format(spaceStore.data.portfolios[k].nav) }}</span>
						<span v-if="type == 'pl'">{{ $format(spaceStore.data.portfolios[k].pl_range) }}</span>
						{{ spaceStore.settings.general.currency }}
					</div>

					<div
						style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
						v-show="!error" v-if="!chartProcessing"
					>

						<Line :data="chartData.data" :options="chartData.options"></Line>

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
				chartProcessing: false,
				chartData: null,
				activePortfolio: null
			}
		},
		methods: {
			async fetchPortfolios() {

				this.portfolios = []

				// TODO Consider refactor here
				// Some weird logic that I do not like

				this.spaceStore.data.portfolios = this.spaceStore.settings.general.portfolios.map((o, k) => {

					let filters = {
						portfolios: o,
						currency: this.spaceStore.settings.general.currency,
						date_to: this.spaceStore.settings.general.date_to,
						date_from: this.spaceStore.settings.general.date_from
					}


					useApi('reportsSummary.get', {
						filters: filters
					}).then((stats) => {
						if (stats.error) {
							this.spaceStore.data.portfolios[k].nav = '--'
							this.spaceStore.data.portfolios[k].pl_range = '--'
							this.spaceStore.data.portfolios[k].change.price = '--'
							this.spaceStore.data.portfolios[k].change.percent = '--'
						}

						this.spaceStore.data.portfolios[k].nav = stats.total.nav
						this.spaceStore.data.portfolios[k].pl_range = stats.total.pl_range
						this.spaceStore.data.portfolios[k].change.price = stats.total.pl_daily
						this.spaceStore.data.portfolios[k].change.percent =
							Math.round(stats.total.pl_daily_percent * 100) / 100


						console.log('this.spaceStore.data.portfolios', this.spaceStore.data.portfolios)

					})

					return {
						id: o,
						name: o,
						user_code: o,
						nav: '-',
						pl_range: '-',
						change: {
							price: '-',
							percent: '-'
						}
					}
				})

				console.log('this.portfolios', this.portfolios)

			},
			onSwiper(swiper) {

				let slideIndex = this.spaceStore.portfolioList.findIndex(
					(o) => o.user_code == this.activePortfolio
				)

				if (slideIndex != -1) {
					swiper.slideTo(slideIndex)
					this.init()
				}
			},
			async reloadChart() {

				try {
					this.chartProcessing = true
					await this.fetchHistory()
					await this.createChart()
					this.chartProcessing = false
				} catch (error) {
					console.error('Could not create history chart', error)
				}

			},
			async refresh() {

				this.processing = true

				await this.fetchPortfolios()
				await this.reloadChart()

				this.processing = false

			},
			async init() {

				this.activePortfolio = this.$route.query.tab

				this.processing = true

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

				let cacheName

				if (this.type == 'balance') {
					cacheName = this.type + this.activePortfolio + this.date_to
				} else if (this.type == 'pl') {
					cacheName = this.type + this.activePortfolio + this.date_to + this.date_from
				}

				console.log('localChartCache', this.localChartCache)
				console.log('cacheName', cacheName)

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


				console.log('HistoryChart.chartData', this.chartData)

			},
			async fetchHistory() {
				let filters = {
					portfolio: this.activePortfolio,
					date_to: this.date_to
				}
				this.error = ''

				if (this.date_from) filters.date_from = this.date_from

				let cacheName

				if (this.type == 'balance') {
					cacheName = this.type + this.activePortfolio + this.date_to
				} else if (this.type == 'pl') {
					cacheName = this.type + this.activePortfolio + this.date_to + this.date_from
				}

				console.log('cacheName.cacheName', cacheName)
				let histNav;
				try {

					histNav = await useApi('widgetsHistory.get', {
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

				} catch (e) {
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

				console.log('fetchHistory.localChartCache', this.localChartCache)

			},
			onSlideChange(swiper) {

				let userCode = this.spaceStore.portfolioList[swiper.realIndex]?.user_code

				console.log('onPortfolioChange.userCode', userCode)


				this.activePortfolio = userCode

				this.reloadChart(); // TODO consider prefetch nav history once

				this.$emit('portfolioChange', {
					activePortfolio: this.activePortfolio
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
