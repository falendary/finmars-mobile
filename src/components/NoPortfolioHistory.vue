<template>
	<div class="portfolio-metric-card-no-data" style="width: 80vw; margin: 0 auto;">

		<h3>No data</h3>
		<p>
			Seems there is not data yet for <b>{{ spaceStore.settings.general.date_to }}</b>
		</p>
		<p>
			Please contact your Data Manager or try run calculation manually
		</p>

		<ion-button
			style="max-width: 50vw; margin: 1rem auto;"
			class="ion-margin-horizontal"
			fill="outline"
			expand="block"
			@click="calculate()"
		>
			Calculate
		</ion-button>

	</div>
</template>

<script>
	import {
		alertController,
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
			IonSelectOption
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
			async calculate() {

				let segmentation_type = 'business_days_end_of_months';

				if (this.spaceStore.settings.general.period_type == 'daily') {
					segmentation_type = 'business_days';
				}

				this.spaceStore.settings.general.portfolios.forEach((portfolio) => {

					useApi('portfolioHistoryCalculate.post', {
						body: {
							'portfolio': portfolio,
							'currency': this.spaceStore.settings.general.currency,
							'pricing_policy': this.spaceStore.settings.general.pricing_policy,
							'date': this.spaceStore.settings.general.date_to,
							'segmentation_type': segmentation_type,
							'period_type': this.spaceStore.settings.general.period_type,
							'cost_method': 'avco', // avco
							'performance_method': 'modified_dietz',
							'benchmark': 'sp_500'
						}
					})

				})

				const alert = await alertController.create({
					header: 'Calculation is in progress',
					message: 'Please, wait for a few minutes and refresh the page',
					buttons: ['Ok']
				})

				await alert.present()

			},
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

		},
		mounted() {


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
