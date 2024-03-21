<template>
	<div class="">

		<div class="portfolio-metric-grid-container" v-if="!processing && portfolioHistoryItems.length">

			<div v-for="metric in portfolioHistoryItems" :key="metric.key" class="portfolio-metric-card">
				<h3>{{ metric.name }}</h3>
				<p v-if="metric.value !== null">{{ metric.value }}</p>
				<p v-else>-</p>
			</div>

		</div>

		<div v-if="!processing && !portfolioHistoryItems.length">

			<no-portfolio-history></no-portfolio-history>

		</div>

		<div class="portfolio-metric-grid-container" v-if="processing">
			<div v-for="(metric, index) in [1,1,1,1,1,1]" :key="index" class="portfolio-metric-card">
				<IonSkeletonText
					:animated="true"
					style="width: 50%; height: 16px; margin-bottom: 8px;"
				/>
				<IonSkeletonText
					:animated="true"
					style="width: 100%; height: 24px"
				/>
			</div>
		</div>

	</div>
</template>

<script>
	import {
		IonApp,
		IonButton,
		IonButtons,
		IonIcon,
		IonModal,
		IonRouterOutlet,
		IonSelect,
		IonSelectOption,
		IonSkeletonText
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import useApi from '@/composables/useApi.js'
	import NoPortfolioHistory from '@/components/NoPortfolioHistory.vue'

	export default {
		components: {
			IonSkeletonText,
			IonIcon,
			IonModal,
			IonButton,
			IonButtons,
			ProgressCircular,
			IonRouterOutlet,
			Suspense,
			IonApp,
			Passcode,
			IonSelect,
			IonSelectOption,
			NoPortfolioHistory
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {
			portfolio: {
				type: String,
				required: true
			}
		},
		emits: ['refresher'],
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				portfolioHistoryItems: [],
				processing: false
			}
		},
		methods: {
			async refresh() {
				await this.getPortfolioHistory()
			},
			async getPortfolioHistory() {

				// console.log('Metricsblock.getPortfolioHistory')

				this.processing = true

				this.portfolioHistory = null
				this.portfolioHistoryItems = []

				const data = await useApi('portfolioHistory.get', {
					filters: {
						status: 'ok',
						period_type: this.spaceStore.settings.general.period_type,
						portfolio__user_code: this.portfolio,
						pricing_policy__user_code: this.spaceStore.settings.general.pricing_policy,
						currency__user_code: this.spaceStore.settings.general.currency,
						date_before: this.spaceStore.settings.general.date_to,
						date_after: this.spaceStore.settings.general.date_to
					}
				})


				if (data.results.length) {
					this.portfolioHistory = data.results[0]

					// this.portfolioHistoryItems.push({
					// 	'name': 'NAV',
					// 	'key': 'nav',
					// 	'value': this.$format(this.portfolioHistory.nav) + ' ' + this.spaceStore.settings.general.currency
					// })

					this.portfolioHistoryItems.push({
						'name': 'GAV',
						'key': 'gav',
						'value': this.$format(this.portfolioHistory.gav || 0) + ' ' + this.spaceStore.settings.general.currency
					})

					this.portfolioHistoryItems.push({
						'name': 'Deposit',
						'key': 'cash_inflow',
						'value': this.$format(this.portfolioHistory.cash_inflow) + ' ' + this.spaceStore.settings.general.currency
					})

					if (this.portfolioHistory.cumulative_return) {

						this.portfolioHistoryItems.push({
							'name': 'Return',
							'key': 'cumulative_return',
							'value': parseFloat(this.portfolioHistory.cumulative_return * 100).toFixed(2) + '%'
						})

					}

					this.portfolioHistoryItems.push({
						'name': 'P&L',
						'key': 'total',
						'value': this.$format(this.portfolioHistory.total) + ' ' + this.spaceStore.settings.general.currency
					})

					this.portfolioHistoryItems.push({
						'name': 'Withdraw',
						'key': 'cash_outflow',
						'value': this.$format(this.portfolioHistory.cash_outflow) + ' ' + this.spaceStore.settings.general.currency
					})

					if (this.portfolioHistory.annualized_return) {
						this.portfolioHistoryItems.push({
							'name': 'Return p.a.',
							'key': 'annualized_return',
							'value': parseFloat(this.portfolioHistory.annualized_return * 100).toFixed(2) + '%'
						})
					}

					if (this.portfolioHistory.portfolio_volatility) {
						this.portfolioHistoryItems.push({
							'name': 'Portfolio Volatility',
							'key': 'portfolio_volatility',
							'value': parseFloat(this.portfolioHistory.portfolio_volatility).toFixed(2)
						})
					}

					if (this.portfolioHistory.annualized_portfolio_volatility) {
						this.portfolioHistoryItems.push({
							'name': 'Annualized Portfolio Volatility',
							'key': 'annualized_portfolio_volatility',
							'value': parseFloat(this.portfolioHistory.annualized_portfolio_volatility).toFixed(2) + '%'
						})
					}

					if (this.portfolioHistory.sharpe_ratio) {
						this.portfolioHistoryItems.push({
							'name': 'Sharpe Ratio',
							'key': 'sharpe_ratio',
							'value': parseFloat(this.portfolioHistory.sharpe_ratio).toFixed(2)
						})
					}

					if (this.portfolioHistory.max_annualized_drawdown) {
						this.portfolioHistoryItems.push({
							'name': 'Max Annualized Drawdown',
							'key': 'max_annualized_drawdown',
							'value': parseFloat(this.portfolioHistory.max_annualized_drawdown).toFixed(2)
						})
					}

					if (this.portfolioHistory.betta) {
						this.portfolioHistoryItems.push({
							'name': 'Betta',
							'key': 'betta',
							'value': parseFloat(this.portfolioHistory.betta).toFixed(2)
						})
					}

					if (this.portfolioHistory.alpha) {
						this.portfolioHistoryItems.push({
							'name': 'Alpha',
							'key': 'alpha',
							'value': parseFloat(this.portfolioHistory.alpha).toFixed(2)
						})
					}

					if (this.portfolioHistory.correlation) {
						this.portfolioHistoryItems.push({
							'name': 'Correlation',
							'key': 'correlation',
							'value': parseFloat(this.portfolioHistory.correlation).toFixed(2)
						})
					}

					if (this.portfolioHistory.weighted_duration) {
						this.portfolioHistoryItems.push({
							'name': 'Weighted Duration',
							'key': 'weighted_duration',
							'value': parseFloat(this.portfolioHistory.weighted_duration).toFixed(2)
						})
					}

				}

				this.processing = false

			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

			this.portfolioHistoryItems = []

			this.$emit('refresher', this.refresh)


		},

		watch: {
			// Watch for changes in activeTab prop
			portfolio(newValue, oldValue) {

				// // console.log('metricsBlock.portfolio.newValue', newValue)
				// // console.log('metricsBlock.portfolio.oldValue', oldValue)

				if (Array.isArray(newValue) && newValue.length && Array.isArray(oldValue) && oldValue.length) {
					if (newValue[0] !== oldValue[0]) {
						this.getPortfolioHistory()
					}
				}

			}

		},
		mounted() {

			this.getPortfolioHistory()

		},
		beforeUnmount() {


		}
	}

</script>

<style lang="scss" scoped>

	.portfolio-metric-grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
		gap: 10px;
		padding: 10px;
	}

	.portfolio-metric-card-no-data {
		text-align: center;
		font-size: .7rem;
	}

	.portfolio-metric-card {

		h3 {
			font-weight: bold;
			font-size: .8rem;
			margin: 0 0 0.5rem;
		}

		p {
			margin: 0;
			color: var(--ion-color-neutral)
		}

		background: var(--ion-card-background);
		border: 1px solid var(--ion-border-color);
		border-radius: 8px; /* Rounded corners */
		padding: 0.5rem;
		text-align: left;

		font-size: .9rem;


	}


</style>
