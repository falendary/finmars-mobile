<template>
	<swiper :slides-per-view="'auto'" :space-between="10" class="indicators">
		<swiper-slide class="indicators_items" v-for="item in indicators">
			<div class="ii_header">{{ item.name }}</div>
			<div class="ii_price">
				<template v-if="item.price !== null">
					{{ $format(item.price) }} {{ currency }}
				</template>
				<IonSkeletonText
					v-else
					:animated="true"
					style="width: 80%; height: 24px; margin: 0"
				/>
			</div>

			<ChangePrice v-if="item.price !== null" :percent="item.percent" />
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
	import ChangePrice from '@/components/ChangePrice.vue'
	import useApi from '@/composables/useApi'

	const props = defineProps({
		portfolioId: Array,
		date: String,
		currency: String,
	})

	let indicators = reactive([
		{
			id: 1,
			name: 'Daily p/l',
			price: null,
			percent: null,
		},
		{
			id: 2,
			name: 'Month to date (MTD) P/L',
			price: null,
			percent: null,
		},
		{
			id: 3,
			name: 'Daily p/l',
			price: null,
			percent: null,
		},
	])

	init()

	watch(props, init)

	async function init() {
		let filters = {
			date_to: props.date,
			currency: props.currency,
		}

		if (props.portfolioId) filters.portfolios = props.portfolioId

		let res = await useApi('reportsSummary.get', {
			filters,
		})

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
		background: #fff;
		padding: 9px;
		padding-top: 6px;
		border-radius: 5px;
		width: 132px;
		box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
	}
	.ii_header {
		font-size: 12px;
		line-height: 16.5px;
		font-weight: 500;
		color: #747474;
		height: 33px;
		margin-bottom: 5px;
	}
	.ii_price {
		font-size: 13px;
		font-weight: 600;
		line-height: 24px;
		margin-bottom: 3px;
	}
</style>
