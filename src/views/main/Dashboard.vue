<template>
	<ion-page>
		<ion-content class="content">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="welcome-block">
				Welcome Back, {{ username }}
			</div>

			<div class="header flex sb aic">
				<div>All Portfolios</div>
				<div class="header_info">
					{{ dayjs(store.settings.general.date_to).format('DD MMM YYYY') }}
				</div>
			</div>

			<div
				class="main_chart"
				v-if="store.layout?.dashboard?.isShowHistoryChart"
			>
				<div class="main_chart_h">Net Asset Value (NAV)</div>
				<div class="main_chart_price">
					- {{ store.settings.general.currency }}
				</div>

				<div
					v-show="isReadyChart"
					style="height: 80px; width: calc(100% + 10px); margin: 0 0 -5px -5px"
				>
					<canvas id="myChart"><p>Chart</p></canvas>
				</div>
				<div
					v-show="!isReadyChart"
					class="center aic"
					style="height: 80px; margin: 0 0 -5px -5px"
				>
					<IonSpinner style="width: 100px" color="primary" name="bubbles" />
				</div>
			</div>

			<Indicators
				:currency="store.settings.general.currency"
				:date="store.settings.general.date_to"
			/>

			<div class="header">Portfolios</div>

			<div class="portfolios" v-if="portfolios?.length">
				<div
					class="portfolios_item"
					v-for="item in portfolios"
					@click="$router.push('/main/balance?tab=' + item.user_code)"
				>
					<div class="pi_first_line flex aic sb">
						<div class="pi_header">{{ item.name }}</div>
						<div class="pi_price_change">
							<IonSkeletonText
								v-if="item.change.price == '-'"
								:animated="true"
								style="width: 60px; height: 24px"
							/>
							<template v-else>{{ $format(item.change.price) }}</template>
						</div>
					</div>
					<div class="flex aic sb">
						<div class="pi_price">
							<IonSkeletonText
								v-if="item.price == '-'"
								:animated="true"
								style="width: 100px; height: 24px"
							/>
							<template v-else
								>{{ $format(item.price) }}
								{{ store.settings.general.currency }}</template
							>
						</div>

						<IonSkeletonText
							v-if="item.change.percent == '-'"
							:animated="true"
							style="width: 80px; height: 25px"
						/>
						<ChangePrice v-else :percent="item.change.percent" />
					</div>
				</div>
			</div>

			<div class="portfolios" v-if="portfolios === null">
				<div class="portfolios_item" v-for="item in [1, 1, 1]">
					<div class="pi_first_line flex aic sb">
						<div class="pi_header">
							<IonSkeletonText
								:animated="true"
								style="width: 130px; height: 24px"
							/>
						</div>
						<div class="pi_price_change">
							<IonSkeletonText
								:animated="true"
								style="width: 60px; height: 24px"
							/>
						</div>
					</div>
					<div class="flex aic sb">
						<div class="pi_price">
							<IonSkeletonText
								:animated="true"
								style="width: 100px; height: 24px"
							/>
						</div>
						<IonSkeletonText
							:animated="true"
							style="width: 80px; height: 25px"
						/>
					</div>
				</div>
			</div>

			<div class="portfolios" v-if="portfolios?.length === 0">
				No portfolios
			</div>

			<div class="header">Last transactions for 3 Month</div>

			<TransactionList
				reportType="pl"
				displayMode="compact"
				:options="transactionsOpts"
			/>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import dayjs from 'dayjs'
	import {
		IonSkeletonText,
		IonRefresher,
		IonRefresherContent,
		IonButton,
		IonToolbar,
		IonSpinner,
	} from '@ionic/vue'

	import Indicators from '@/components/Indicators.vue'
	import ChangePrice from '@/components/ChangePrice.vue'
	import TransactionList from '@/components/TransactionList.vue'

	import { statsChart, radio, library, settingsSharp } from 'ionicons/icons'

	import {
		Chart,
		LineElement,
		PointElement,
		LineController,
		ScatterController,
		CategoryScale,
		LinearScale,
		Decimation,
		Filler,
	} from 'chart.js'
	import { onMounted, ref, reactive, watch } from 'vue'
	import useApi from '@/composables/useApi.js'
	import useMiniStore from '@/composables/useMiniStore'
	import { Preferences } from '@capacitor/preferences'
	// Stores the controller so that the chart initialization routine can look it up
	Chart.register(
		LineElement,
		PointElement,
		LineController,
		ScatterController,
		CategoryScale,
		LinearScale,
		Decimation,
		Filler
	)

	let allPorfoliosChart
	let width, height, gradient

	let result = await useApi('user.get')
	let username = ref(result.first_name || result.username)

	const portfolios = ref(null)
	const store = useMiniStore()

	const transactionsOpts = reactive({
		end_date: store.settings.general.date_to,
		begin_date: dayjs(store.settings.general.date_to)
			.add(-3, 'month')
			.format('YYYY-MM-DD'),
		portfolios: store.settings.general.portfolios || [],
		filter_entry_user_code: null,
	})

	let isReadyChart = ref(false)
	let historyNav = null

	init()

	watch([store.settings.dashboard, store.settings.general], () => {
		transactionsOpts.end_date = store.settings.general.date_to
		transactionsOpts.begin_date = dayjs(store.settings.general.date_to)
			.add(-3, 'month')
			.format('YYYY-MM-DD')

		refresh()
	})

	async function init() {
		await Promise.all([fetchPortfolios(), fetchHistoryNav()])
	}

	async function refresh(event) {
		await init()

		if (event) event.target.complete()
	}

	onMounted(() => {
		createChart()
	})

	async function fetchPortfolios() {
		portfolios.value = store.portfolioList.map((o, k) => {
			useApi('reportsSummary.get', {
				filters: {
					portfolios: o.user_code,
					currency: store.settings.general.currency,
					date_to: store.settings.general.date_to,
				},
			}).then((stats) => {
				if (stats.error) {
					portfolios.value[k].price = '--'
					portfolios.value[k].change.price = '--'
					portfolios.value[k].change.percent = '--'
				}

				portfolios.value[k].price = stats.total.nav
				portfolios.value[k].change.price = stats.total.pl_daily
				portfolios.value[k].change.percent =
					Math.round(stats.total.pl_daily_percent * 100) / 100
			})

			return {
				id: o.id,
				name: o.name,
				user_code: o.user_code,
				price: '-',
				change: {
					price: '-',
					percent: '-',
				},
			}
		})
	}
	async function fetchHistoryNav() {
		// historyNav = await useApi('widgetsHistory.get', {
		// 	params: {
		// 		type: 'nav',
		// 	},
		// 	provider: null,
		// 	filters: {
		// 		portfolio: 2, // Need all
		// 		date_to: store.settings.general.date_to,
		// 	},
		// })
		historyNav = undefined
		if (!historyNav || historyNav.error) return false

		if (allPorfoliosChart) {
			let labels = historyNav.items.map((o) => o.date)
			let data = historyNav.items.map((o) => o.nav)

			if (data[0] === null) {
				labels.unshift('hack')
				data.unshift(0)
			}
			if (data[data.length - 1] === null) {
				labels.push('hack')
				data.push(0)
			}

			allPorfoliosChart.data.labels = labels
			allPorfoliosChart.data.datasets[0].data = data

			isReadyChart.value = true

			allPorfoliosChart.update()
		}
	}

	async function createChart() {
		const skipped = (ctx, value) =>
			ctx.p0.skip || ctx.p1.skip ? value : undefined

		const down = (ctx, value) =>
			ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined

		allPorfoliosChart = new Chart(`myChart`, {
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
						segment: {
							borderColor: (ctx) =>
								skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
							borderDash: (ctx) => skipped(ctx, [6, 6]),
							backgroundColor: (ctx) => skipped(ctx, 'rgb(0,0,0,0.1)'),
						},
						spanGaps: true,
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
		})
	}
</script>

<style lang="scss" scoped>
	ion-content {
		--padding-top: 16px;
		--padding-bottom: 25px;
		//--background: #fafafa;
		--background: #eff4f7;
	}
	ion-skeleton-text {
		margin: 0;
	}
	.welcome-block {
		padding: 0 15px;
		//margin-top: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 1rem;
		background: #1e1e1e;
		color: #fff;
		margin: 0;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.6);
		//margin-top: 0.3rem;
	}
	.header {
		padding: 0 15px;
		//color: #747474;
		color: #363636;
		font-weight: 500;
		//font-size: 20px;
		font-size: 1.1rem;
		margin-bottom: 15px;
	}
	.header_info {
		font-size: 0.6rem;
	}
	.main_chart {
		margin: 0 15px;
		background: #fff;
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
			padding-bottom: 30px;
			font-weight: 600;
			font-size: 20px;
			line-height: 24px;
		}
	}
	.portfolios {
		margin: 0 15px 15px;
	}
	.portfolios_item {
		border-radius: 5px;
		background: #fff;
		//padding: 7px 10px;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
		padding: 1rem;

		& + & {
			margin-top: 10px;
		}
	}
	.pi_first_line {
		margin-bottom: 4px;
	}
	.pi_header {
		font-weight: 500;
		font-size: 14px;
		line-height: 24px;
		color: #747474;
	}
	.pi_price {
		//font-size: 20px;
		font-size: 1.3rem;
		font-weight: bold;
		line-height: 24px;
	}
	.pi_price_change {
		font-weight: 500;
		font-size: 16px;
		line-height: 24px;
	}
</style>
