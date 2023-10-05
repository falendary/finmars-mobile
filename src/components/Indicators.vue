<template>
	<swiper :slides-per-view="'auto'" :space-between="16" class="indicators">
		<swiper-slide class="indicators_items" v-for="item in indicators">
			<div class="ii_header">{{ item.name }}</div>
			<div class="ii_price">
				<template v-if="item.price !== null">
					<span class="ii_price_value">{{ $format(item.price) }}</span>  <span class="ii_price_currency">{{ currency }}</span>
				</template>
				<IonSkeletonText
					v-else
					:animated="true"
					style="width: 80%; height: 24px; margin: 0"
				/>
			</div>

			<ChangePriceComp v-if="item.price !== null" :percent="item.percent" />
			<IonSkeletonText
				v-else
				:animated="true"
				style="width: 60%; height: 25px; margin: 0"
			/>
		</swiper-slide>
	</swiper>
</template>

<script setup>
	import { ref, reactive, watch } from 'vue'
	import {
		IonSkeletonText,
		IonTitle,
		IonIcon,
		IonButtons,
		IonButton,
		IonTabButton,
		IonFooter,
		IonToolbar,
	} from '@ionic/vue'

	import { Swiper, SwiperSlide } from 'swiper/vue'
	import 'swiper/css'
	import ChangePriceComp from '@/components/ChangePrice.vue'
	import useApi from '@/composables/useApi'
	import { nextTick } from 'vue'

	const emits = defineEmits(['refresher', 'nav'])
	const props = defineProps({
		portfolioId: Array,
		date: String,
		currency: String,
		pricing_policy: String,
		date_from: String,
		type: {
			type: String,
			default: 'balance',
		},
	})

	let indicators = reactive([
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
	])

	init()
	emits('refresher', refresh)

	async function refresh() {
		indicators.forEach((item) => {
			item.price = null
			item.percent = null
		})
		await nextTick()
		await init()
	}
	async function init() {
		let filters = {
			date_to: props.date,
			currency: props.currency,
			pricing_policy: props.pricing_policy
		}

		if (props.date_from) filters.date_from = props.date_from

		if (props.portfolioId) filters.portfolios = props.portfolioId

		let res = await useApi('reportsSummary.get', {
			filters,
		})

		if (!res) {
			indicators[0].price = 0.0
			indicators[0].percent = 0.0

			indicators[1].price = 0.0
			indicators[1].percent = 0.0

			indicators[2].price = 0.0
			indicators[2].percent = 0.0

			return false
		}

		// TODO Refactor this shit
		if (props.type == 'pl') {
			emits('nav', res.total.pl_range)
		} else {
			emits('nav', res.total.nav)
		}

		indicators[0].price = res.total.pl_daily
		indicators[0].percent = Math.round(res.total.pl_daily_percent * 100) / 100

		indicators[1].price = res.total.pl_mtd
		indicators[1].percent = Math.round(res.total.pl_mtd_percent * 100) / 100

		indicators[2].price = res.total.pl_ytd
		indicators[2].percent = Math.round(res.total.pl_ytd_percent * 100) / 100
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
