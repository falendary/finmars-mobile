<template>
	<swiper
		v-if="store.portfolioList.length"
		v-bind="$attrs"
		:pagination="true"
		:modules="[Pagination]"
		class="balance_swiper"
		@swiper="onSwiper"
		@slideChange="onPortfolioChange"
	>
		<swiper-slide v-for="(item, k) in store.portfolioList">
			<div class="main_chart">
				<div class="main_chart_h">Net Asset Value (NAV)</div>
				<div class="main_chart_price">
					- {{ store.settings.balance.currency }}
				</div>

				<div
					style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
					v-show="!error"
				>
					<canvas v-if="k == 0" id="lineChart" ref="chartCanvas"
						><p>Chart</p></canvas
					>
					<div v-else id="lineChart" class="center aic" style="height: 100%">
						<IonSpinner style="width: 100px" color="primary" name="bubbles" />
					</div>
				</div>
				<div
					class="center aic"
					style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
					v-show="error"
				>
					{{ error }}
				</div>
			</div>
		</swiper-slide>
	</swiper>

	<div v-bind="$attrs" style="height: 206px" v-if="!store.portfolioList.length">
		<div class="main_chart">
			<div class="main_chart_h">Net Asset Value (NAV)</div>
			<div class="main_chart_price">
				<IonSkeletonText :animated="true" style="width: 30%; height: 24px" />
			</div>

			<IonSkeletonText
				:animated="true"
				style="width: 100%; height: 80px; margin-bottom: -5px"
			/>
		</div>
	</div>
</template>

<script setup>
	import { nextTick, onMounted, ref, watch, computed } from 'vue'
	import { useRoute, useRouter } from 'vue-router'

	import {
		IonSkeletonText,
		IonSpinner,
		IonButtons,
		IonButton,
		IonTabButton,
		IonFooter,
		IonToolbar,
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

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { Pagination } from 'swiper'
	import 'swiper/css'

	import useApi from '@/composables/useApi'
	import useMiniStore from '@/composables/useMiniStore'

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

	const emits = defineEmits(['portfolioChange'])
	const props = defineProps({
		portfolio: String,
		date_to: String,
		date_from: String,
		currency: String,
		type: {
			type: String,
			default: 'nav',
		},
	})
	const store = useMiniStore()
	const router = useRouter()
	const route = useRoute()
	let error = ref('')
	const onSwiper = (swiper) => {
		let slideIndex = store.portfolioList.findIndex(
			(o) => o.user_code == activePortfolio.value
		)
		swiper.slideTo(slideIndex)

		if (slideIndex === 0) {
			fetchHistory()
		}
	}

	const activePortfolio = computed(() => {
		return route.query.tab
	})
	let portfolioUserCode = route.query.tab

	let chartCanvas = ref(null)
	let histNav = null
	let lineChartObj
	let width, height, gradient

	watch(props, () => {
		init()
	})

	async function init() {
		fetchHistory()
	}

	onMounted(() => {
		if (!store.portfolioList.length) {
			watch(
				() => store.portfolioList,
				async (newVal, oldVal, unwatch) => {
					await nextTick()
					createChart()

					unwatch()
				}
			)
		} else {
			createChart()
		}
	})

	async function fetchHistory() {
		let filters = {
			portfolio: portfolioUserCode,
			date_to: props.date_to,
		}
		error.value = ''

		if (props.date_from) filters.date_from = props.date_from

		histNav = await useApi('widgetsHistory.get', {
			params: {
				type: props.type,
			},
			provider: null,
			filters,
		})

		if (!histNav || histNav.error) {
			error.value = 'No data'
			return false
		}
		console.log('histNav:', histNav)

		if (lineChartObj) {
			lineChartObj.data.labels = histNav.items.map((o) => o.date)
			lineChartObj.data.datasets[0].data = histNav.items.map(
				(o) => o[props.type == 'nav' ? 'nav' : 'total']
			)

			lineChartObj.update()
		}
	}

	function createChart() {
		lineChartObj = new Chart(chartCanvas.value, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Dataset 1',
						data: [],
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
					// {
					// 	label: 'Dataset 1',
					// 	data: [20, 30, 35, 40, 20, 35, 20, 10, 13, 30],
					// 	borderColor: 'rgba(30, 30, 30, 0.2)',
					// 	borderWidth: 1,
					// 	pointBackgroundColor: 'transparent',
					// 	pointBorderColor: 'transparent',
					// 	stepped: true,
					// },
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
			plugins: [
				{
					id: 'custom_canvas_background_color',
					afterDatasetDraw: (chart, args, options) => {
						let metas = chart.getSortedVisibleDatasetMetas()

						const { ctx } = chart

						ctx.save()
						ctx.globalCompositeOperation = 'destination-over'
						ctx.fillStyle = options.nonActiveColor

						metas[0].data.forEach((coll, key) => {
							if (chart.data.datasets[0].data[key] === null) {
								ctx.fillRect(
									coll.x,
									chart.chartArea.top,
									2,
									chart.chartArea.height
								)
							}
						})
						ctx.restore()
					},
					defaults: {
						nonActiveColor: 'rgb(203, 203, 203, 0.4)',
					},
				},
			],
		})
	}

	async function onPortfolioChange(swiper) {
		let prevChart = swiper.slidesEl.querySelector('canvas#lineChart')

		let prevChartParent = prevChart.parentNode
		let nextChart =
			swiper.slides[swiper.activeIndex].querySelector('#lineChart')
		console.log('swiper.activeIndex:', swiper.activeIndex)

		portfolioUserCode = store.portfolioList[swiper.activeIndex]?.user_code
		emits('portfolioChange', portfolioUserCode)

		router.push({
			query: {
				tab: portfolioUserCode,
			},
		})

		await fetchHistory()

		let oldChild = nextChart.parentNode.replaceChild(prevChart, nextChart)
		prevChartParent.append(oldChild)
		lineChartObj.update()
	}
</script>

<style lang="scss" scoped>
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
</style>
