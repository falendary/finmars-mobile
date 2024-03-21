<template>
	<swiper :slides-per-view="'auto'" :space-between="8" class="indicators">
		<swiper-slide class="indicators_items" v-for="(item, k) in indicators" :key="k" >
			<div class="ii_header">{{ item.name }}</div>
			<div class="ii_price">
				<template v-if="!processing">
					<span class="ii_price_value">{{ $format(item.price) }}</span>  <span class="ii_price_currency">{{ currency }}</span>
				</template>
				<IonSkeletonText
					v-if="processing"
					:animated="true"
					style="width: 80%; height: 24px; margin: 0"
				/>
			</div>

			<ChangePriceComp v-if="!processing" :percent="item.percent" />
			<IonSkeletonText
				v-if="processing"
				:animated="true"
				style="width: 60%; height: 25px; margin: 0"
			/>
		</swiper-slide>
	</swiper>
</template>

<script>
	import {
		IonSkeletonText,
	} from '@ionic/vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import 'swiper/css'
	import ChangePriceComp from '@/components/ChangePrice.vue'
	import useApi from '@/composables/useApi'
	import { nextTick } from 'vue'

	export default {
		components: {
			IonSkeletonText,
			Swiper, SwiperSlide,
			ChangePriceComp
		},

		props: {
			portfolioId: Array,
			date: String,
			currency: String,
			pricing_policy: String,
			date_from: String,
			type: {
				type: String,
				default: 'balance',
			}
		},
		emits: ['refresher'],
		data() {
			return {
				processing: false,
				indicators: [
					{
						id: 1,
						name: 'Daily Profit & Loss',
						price: null,
						percent: null,
					},
					{
						id: 2,
						name: 'Month to date (MTD) P&L',
						price: null,
						percent: null,
					},
					{
						id: 3,
						name: 'Year to date (YTD) P&L',
						price: null,
						percent: null,
					},
				]
			}
		},
		methods: {
			async refresh() {
				this.indicators.forEach((item) => {
					item.price = null
					item.percent = null
				})
				await nextTick()
				await this.init()
			},
			async init() {

				// console.log('Indicators.init')

				this.processing = true;

				// let filters = {
				// 	date_to: this.date,
				// 	currency: this.currency,
				// 	pricing_policy: this.pricing_policy
				// }
				//
				// if (this.date_from) filters.date_from = this.date_from
				//
				// if (this.portfolioId) filters.portfolios = this.portfolioId

				const params = new URLSearchParams()

				params.append('date_to', this.date)
				params.append('currency', this.currency)
				params.append('pricing_policy', this.pricing_policy)

				if (this.date_from)  {
					params.append('date_from', this.date_from)
				}

				this.portfolioId.forEach(function(item) {
					params.append('portfolios', item)
				})


				let res = await useApi('reportsSummary.get', {
					urlSearchParams: params,
				})

				if (!res) {
					this.indicators[0].price = 0.0
					this.indicators[0].percent = 0.0

					this.indicators[1].price = 0.0
					this.indicators[1].percent = 0.0

					this.indicators[2].price = 0.0
					this.indicators[2].percent = 0.0

					return false
				}

				this.indicators[0].price = res.total.pl_daily
				this.indicators[0].percent = Math.round(res.performance.daily.grand_return * 100) / 100

				this.indicators[1].price = res.total.pl_mtd
				this.indicators[1].percent = Math.round(res.performance.mtd.grand_return * 100) / 100

				this.indicators[2].price = res.total.pl_ytd
				this.indicators[2].percent = Math.round(res.performance.ytd.grand_return * 100) / 100


				this.processing = false;


			},
		},
		mounted() {

			// console.log("indicators mounted")

			this.init()

		},
		created() {

			this.$emit('refresher', this.refresh)

		}
	}

</script>

<style lang="scss" scoped>
	ion-skeleton-text {
		margin: 0;
	}
	.indicators {
		padding: 15px;
	}
	.indicators_items {
		background: var(--ion-card-background);
		padding: 9px;
		padding-top: 6px;
		//border-radius: 5px;
		border-radius: 1.5rem;
		//width: 132px;
		width: 170px;
		min-height: 170px;
		padding: 1rem;
		box-sizing: border-box;
		box-shadow: var(--ion-card-box-shadow);
		border: 1px dotted var(--ion-card-border-color);
	}
	.ii_header {
		font-size: 12px;
		line-height: 16.5px;
		font-weight: 500;
		color: var(--ion-text-color);
		height: 33px;
		margin-bottom: 5px;
	}
	.ii_price {
		//font-size: 13px;

		line-height: 24px;
		margin-bottom: 3px;
		font-size: 0.8rem;
	}
	.ii_price_value {
		font-weight: 600;
	}
	.ii_price_currency {
		opacity: .7;
		font-size: 0.6rem;
	}
</style>
