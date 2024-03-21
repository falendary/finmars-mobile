<template>

	<div class="grand-nav">

		<div v-if="!processing">

			<div v-if="!errorMessage" class="grand-nav-value-holder" @click="goToBalance()">
				<div class="grand-nav-value">{{ grandTotalVerbose }}</div>
				<div class="grand-nav-currency">{{ spaceStore.settings.general.currency }}</div>

			</div>

			<div v-if="errorMessage" class="text-center text-fs-small">
				{{ errorMessage }}
			</div>


		</div>

		<div v-if="processing" style="display: flex;
    flex-direction: column;
    align-items: end;">

			<IonSkeletonText
				:animated="true"
				style="width: 240px; height: 48px"
			/>
			<IonSkeletonText
				:animated="true"
				style="width: 60px; height: 24px; margin-top: 6px;"
			/>

		</div>

	</div>


</template>

<script>/**
 * Created by szhitenev on 30.09.2023.
 */

import { IonSkeletonText } from '@ionic/vue'
import useApi from '@/composables/useApi.js'
import { useRoute, useRouter } from 'vue-router'
import useStore from '@/composables/useStore'
import { computed, nextTick } from 'vue'

export default {
	components: { IonSkeletonText },


	emits: ['refresher'],
	data() {
		return {
			grandTotal: 0,
			grandTotalVerbose: '0',
			errorMessage: '',
			spaceStore: null,
			processing: true

		}
	},

	methods: {
		goToBalance() {
			this.spaceStore.activeTab = 'All';
			this.$router.push('/main/balance')
		},
		async refresh() {
			this.grandTotal = 0
			await nextTick()
			await this.getGrandNav()
		},
		async getGrandNav() {

			this.processing = true
			this.errorMessage = ''

			let res = await useApi('backendBalanceReportGroups.post', {
				body: {
					account_mode: 0, // Ignore Accounts, important
					accounts_cash: [],
					accounts_position: [],
					allocation_detailing: true,
					allocation_mode: 0,
					approach_multiplier: 0.5,
					calculate_pl: true,
					calculationGroup: 'portfolio',
					cost_method: 1,
					expression_iterations_count: 1,
					pl_include_zero: false,
					portfolio_mode: 1,
					frontend_request_options: {
						columns: [
							{
								'key': 'portfolio.name',
								'name': 'Portfolio. Name',
								'value_type': 10
							},
							{
								'key': 'market_value',
								'name': 'Balance. Market value',
								'report_settings': {
									'subtotal_formula_id': 1 // sum
								},
								'value_type': 20
							}
						],
						groups_types: [
							{
								'key': 'portfolio.name',
								'name': 'Portfolio. Name',
								'value_type': 10
							}
						],
						page: 1,
						filter_settings: []
					},
					accounts: this.spaceStore.settings.general.accounts,
					portfolios: this.spaceStore.settings.general.portfolios,
					pricing_policy: this.spaceStore.settings.general.pricing_policy,
					report_currency: this.spaceStore.settings.general.currency,
					report_date: this.spaceStore.settings.general.date_to,
					report_type: 1,
					strategies1: [],
					strategies2: [],
					strategies3: [],
					strategy1_mode: 0,
					strategy2_mode: 0,
					strategy3_mode: 0
				}
			})


			if (res) {

				this.grandTotal = 0
				this.grandTotalVerbose = '0'

				try {
					res.items.forEach((item) => {

						this.grandTotal = this.grandTotal + item.subtotal.market_value

					})

					if (isNaN(this.grandTotal)) {

						this.errorMessage = 'Could not calculate NAV. (Check prices)'

					} else {
						this.grandTotalVerbose = this.grandTotal.toLocaleString('de-CH', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						})
					}
				} catch (e) {
					this.errorMessage = 'Could not calculate NAV. (Check prices)'
				}

			} else {
				this.errorMessage = 'Could not get NAV'
			}

			this.processing = false

		}

	},
	async mounted() {

		await this.getGrandNav()

	},

	created() {

		this.store = useStore()
		this.route = useRoute()
		this.router = useRouter()

		this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		this.$emit('refresher', this.refresh)

	},
	beforeUnmount() {

	}

}

</script>

<style lang="scss">

	.grand-nav {
		padding: 1rem;
		background: var(--ion-card-background);
		border-radius: 1.5rem;
		text-align: right;
		box-shadow: var(--ion-card-box-shadow);
		margin: 1rem;
		border: 1px dotted var(--ion-card-border-color);
	}

	.grand-nav-value {
		font-size: 2.5rem;
		font-weight: bold;
	}

	.grand-nav-currency {
		font-size: 1rem;
		opacity: .7;
	}

	.explore-button {
		margin: 1rem;
		border: var(--ion-color-primary) 1px solid;
		border-radius: 0.25rem;
		display: inline-block;
		padding: 0.5rem 1.5rem;
		line-height: 1;
		font-size: 1.2rem;
		margin-right: 0;
	}


</style>
