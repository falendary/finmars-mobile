<template>
	<ion-page>

		<ion-header>
			<ion-toolbar class="app-header">

				<div class="app-header-inner">

					<div class="app-header-inner-space-name">{{ store.activeSpaceName || 'Finmars' }}</div>

					<div class="display-flex flex-end flex-align-center">

						<ion-select
							v-model="spaceStore.settings.general.currency"
							placeholder="Currency"
						>
							<ion-select-option
								v-for="item in spaceStore.currencies"
								:value="item.user_code"
							>
								{{ item.short_name }}
							</ion-select-option>
						</ion-select>

						<ion-modal :keep-contents-mounted="true">
							<ion-datetime id="datetime_date" displayFormat="YYYY-MM-DD"
														v-model="spaceStore.settings.general.date_to"
														:prefer-wheel="true"
														presentation="date"
														show-default-buttons
							></ion-datetime>
						</ion-modal>

						<ion-datetime-button class="header-date-button" datetime="datetime_date" />

					</div>

				</div>


			</ion-toolbar>

		</ion-header>

		<ion-content class="content">
			<ion-refresher slot="fixed" @ionRefresh="refresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div v-if="spaceStore.settings.general.portfolios.length">

				<div class="welcome-block">
					Welcome Back, {{ username }}
				</div>

				<div class="dashboard-content">

					<div class="header">Grand Total</div>

					<grand-nav @refresher="grandNavRefresher = $event"></grand-nav>

					<!--				<div class="header flex sb aic">-->
					<!--					<div>All Portfolios</div>-->
					<!--					<div class="header_info">-->
					<!--						{{ dayjs(spaceStore.settings.general.date_to).format('DD MMM YYYY') }}-->
					<!--					</div>-->
					<!--				</div>-->

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

					<!--				<Indicators-->
					<!--					:portfolioId="spaceStore.settings.general.portfolios"-->
					<!--					:currency="spaceStore.settings.general.currency"-->
					<!--					:pricing_policy="spaceStore.settings.general.pricing_policy"-->
					<!--					:date="spaceStore.settings.general.date_to"-->
					<!--					@refresher="indicatorsRefresher = $event"-->
					<!--				/>-->

					<div class="header">Portfolios</div>

					<div class="portfolios" v-if="portfolios.length">
						<div
							class="portfolios_item"
							v-for="item in portfolios"
							v-bind:key="item.id"
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
										v-if="item.nav == '-'"
										:animated="true"
										style="width: 100px; height: 24px"
									/>
									<template v-else
									>{{ $format(item.nav) }}
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

					<div class="header" v-if="currentMonth">Transactions in {{ currentMonth }}</div>

					<ComplexTransactionList
						:options="transactionsOpts"
					/>

				</div>

			</div>

			<div v-if="!spaceStore.settings.general.portfolios.length">

				<p class="text-center">Nothing to view</p>
				<p class="text-center">Please select Portfolios in Settings</p>

			</div>

		</ion-content>

	</ion-page>
</template>

<script>
	import dayjs from 'dayjs'
	import {
		IonDatetime,
		IonDatetimeButton,
		IonModal,
		IonRefresher,
		IonRefresherContent,
		IonSelect,
		IonSelectOption,
		IonSkeletonText,
		IonSpinner,
		IonToolbar
	} from '@ionic/vue'

	import Indicators from '@/components/Indicators.vue'
	import IndicatorsComp from '@/components/Indicators.vue'
	import ChangePrice from '@/components/ChangePrice.vue'
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
	import { computed, watch } from 'vue'
	import useApi from '@/composables/useApi.js'
	import useStore from '@/composables/useStore'
	import ComplexTransactionList from '@/components/ComplexTransactionList.vue'
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
			IndicatorsComp,
			IonSelectOption,
			IonSelect,
			IonDatetime,
			IonToolbar,
			IonDatetimeButton,
			IonModal,
			IonRefresher, IonRefresherContent, IonSkeletonText, IonSpinner,
			Indicators,
			ChangePrice,
			ComplexTransactionList,
			GrandNav

		},

		data() {
			return {
				processing: false,
				store: null,
				spaceStore: null,
				portfolios: [],
				dayjs: dayjs,
				transactionsOpts: null,
				username: null,
				indicatorsRefresher: null,
				grandNavRefresher: null
			}
		},
		computed: {
			currentMonth() {
				const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
				return monthNames[new Date(this.spaceStore.settings.general.date_to).getMonth()]
			}
		},
		methods: {
			init() {

				console.log('Dashboard.init')

				this.processing = true

				this.fetchPortfolios()

				if (this.indicatorsRefresher) {
					this.indicatorsRefresher()
				}

				if (this.grandNavRefresher) {
					this.grandNavRefresher()
				}


				this.processing = false

			},
			async refresh(event) {
				this.init()

				if (event) event.target.complete()

			},
			async fetchPortfolios() {

				this.portfolios = []

				// TODO Consider refactor here
				// Some weird logic that I do not like

				console.log('DASHBOARD_CONTROLLER: fetchPortfolios', JSON.stringify(this.spaceStore.settings.general.portfolios, null, 4))

				this.portfolios = this.spaceStore.settings.general.portfolios.map((o, k) => {

					useApi('reportsSummary.get', {
						filters: {
							portfolios: o,
							pricing_policy: this.spaceStore.settings.general.pricing_policy,
							currency: this.spaceStore.settings.general.currency,
							date_to: this.spaceStore.settings.general.date_to,
							date_from: this.spaceStore.settings.general.date_from
						}
					}).then((stats) => {
						if (stats.error) {
							this.portfolios[k].nav = '--'
							this.portfolios[k].pl_range = '--'
							this.portfolios[k].change.price = '--'
							this.portfolios[k].change.percent = '--'
						}

						this.portfolios[k].nav = stats.total.nav
						this.portfolios[k].pl_range = stats.total.pl_range
						this.portfolios[k].change.price = stats.total.pl_daily
						this.portfolios[k].change.percent =
							Math.round(stats.performance.daily.grand_return * 100) / 100
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

			async fetchUser() {
				let result = await useApi('user.get')
				this.username = result.first_name || result.username
			}

		},
		async created() {

			console.log('DASHBOARD_CONTROLLER: created')

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore());

			console.log('DASHBOARD_CONTROLLER: this.spaceStore', this.spaceStore)

			this.fetchUser()



			watch(this.spaceStore.settings.general, () => {

				console.log("DASHBOARD_CONTROLLER: watch this.spaceStore.settings.general")

				this.transactionsOpts.end_date = this.spaceStore.settings.general.date_to
				this.transactionsOpts.begin_date = dayjs(this.spaceStore.settings.general.date_to)
					.add(-1, 'month')
					.format('YYYY-MM-DD')

				this.init()

			}, { deep: true })

			this.init();

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
			console.log('DASHBOARD_CONTROLLER: mounted')
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
		margin-top: -0.5rem;
		//margin-top: 0.3rem;
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
		border-radius: 1rem;
		box-shadow: var(--ion-card-box-shadow);
		border: 1px dotted var(--ion-card-border-color);
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
