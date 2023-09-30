<template>
	<ion-page>
		<ion-content class="content">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="welcome-block">
				Welcome Back, {{ username }}
			</div>

			<div class="dashboard-content" v-if="!processing && storeIsReady">

				<div class="header">Grand Total</div>

				<grand-nav></grand-nav>

				<div class="header flex sb aic">
					<div>All Portfolios</div>
					<div class="header_info">
						{{ dayjs(spaceStore.settings.general.date_to).format('DD MMM YYYY') }}
					</div>
				</div>

				<div
					class="main_chart"
					v-if="store.layout?.dashboard?.isShowHistoryChart"
				>
					<div class="main_chart_h">Net Asset Value (NAV)</div>
					<div class="main_chart_price">
						- {{ spaceStore.settings.general.currency }}
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
					:currency="spaceStore.settings.general.currency"
					:date="spaceStore.settings.general.date_to"
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
									{{ spaceStore.settings.general.currency }}
								</template
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

			</div>


		</ion-content>

	</ion-page>
</template>

<script>
	import dayjs from 'dayjs'
	import { IonRefresher, IonRefresherContent, IonSkeletonText, IonSpinner } from '@ionic/vue'

	import Indicators from '@/components/Indicators.vue'
	import ChangePrice from '@/components/ChangePrice.vue'
	import TransactionList from '@/components/TransactionList.vue'
	import GrandNav from '@/components/GrandNav.vue'

	import {
		CategoryScale,
		Chart,
		Decimation,
		Filler,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		ScatterController
	} from 'chart.js'
	import { computed,  reactive, ref, watch } from 'vue'
	import useApi from '@/composables/useApi.js'
	import useStore from '@/composables/useStore'
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

	export default {
		components: {
			IonRefresher, IonRefresherContent, IonSkeletonText, IonSpinner,
			Indicators,
			ChangePrice,
			TransactionList,
			GrandNav

		},
		data() {
			return {
				processing: false,
				spaceStore: null,
				portfolios: [],
				dayjs: dayjs,
				transactionsOpts: null,
				username: null,
				storeIsReady: false

			}
		},
		methods: {
			async init() {

				console.log("Dashboard.init")

				this.processing = true

				await Promise.all([this.fetchPortfolios()])

				this.processing = false

			},
			async refresh(event) {
				await this.init()

				if (event) event.target.complete()

			},
			async fetchPortfolios() {
				this.portfolios = this.spaceStore.portfolioList.map((o, k) => {
					useApi('reportsSummary.get', {
						filters: {
							portfolios: o.user_code,
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
					})

					return {
						id: o.id,
						name: o.name,
						user_code: o.user_code,
						price: '-',
						change: {
							price: '-',
							percent: '-'
						}
					}
				})
			},

			async fetchUser() {
				let result = await useApi('user.get')
				this.username = result.first_name || result.username
			}

		},
		created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.spaces[this.store.activeSpaceCode]);

			this.fetchUser();

			console.log("DASHBOARD_CONTROLLER: storeIsReady change")

			this.init()
			this.storeIsReady = true;

			watch([this.spaceStore.settings.dashboard, this.spaceStore.settings.general], () => {
				this.transactionsOpts.end_date = this.spaceStore.settings.general.date_to
				this.transactionsOpts.begin_date = dayjs(this.spaceStore.settings.general.date_to)
					.add(-3, 'month')
					.format('YYYY-MM-DD')

				this.refresh()
			})

			this.transactionsOpts = {
				end_date: this.spaceStore.settings.general.date_to,
				begin_date: dayjs(this.spaceStore.settings.general.date_to)
					.add(-3, 'month')
					.format('YYYY-MM-DD'),
				portfolios: this.spaceStore.settings.general.portfolios || [],
				filter_entry_user_code: null
			}





		},
		mounted() {

		}
	}





</script>

<style lang="scss" scoped>
	ion-content {
		--padding-top: 16px;
		--padding-bottom: 25px;
		//--background: #fafafa;
		//--background: #eff4f7;
	}

	ion-skeleton-text {
		margin: 0;
	}

	.welcome-block {
		padding: 0 15px;
		//margin-top: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 1rem;
		background: var(--ion-card-background);
		color: var(--ion-text-color);
		border: 1px solid var(--ion-card-border-color);
		margin: 0;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: var(--ion-card-box-shadow);
		//margin-top: 0.3rem;
	}

	.header {
		padding: 0 15px;
		//color: #747474;
		color: var(--ion-text-color);
		font-weight: 400;
		//font-size: 20px;
		font-size: 1.1rem;
		margin-bottom: 15px;
		opacity: .8;
	}

	.header_info {
		font-size: 0.6rem;
	}

	.main_chart {
		margin: 0 15px;
		background: var(--ion-card-background);
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
		background: var(--ion-card-background);
		//padding: 7px 10px;
		//box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
		border-radius: 0.5rem;
	  box-shadow: var(--ion-card-box-shadow);
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
		color: var(--ion-text-color);
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
