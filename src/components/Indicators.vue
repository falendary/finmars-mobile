<template>
	<div class="indicators flex swiper">
		<div class="swiper-wrapper">
			<div class="indicators_items swiper-slide"
				v-for="item in items"
			>
				<div class="ii_header">{{ item.name }}</div>
				<div class="ii_price">{{ $format(item.price) }} {{ item.currency }}</div>
				<ChangePrice :percent="item.percent" />
			</div>
		</div>
	</div>
</template>

<script setup>

	import { onMounted, ref } from 'vue';
	import {
    IonTitle,
    IonIcon,
    IonButtons,
    IonButton,
    IonTabButton,
    IonFooter,
    IonToolbar,
  } from '@ionic/vue';
	import Swiper from 'swiper';
  // import Swiper styles
  import 'swiper/css';
  import ChangePrice from '@/components/ChangePrice.vue'

	const props = defineProps({
		items: Array
	})

	onMounted(() => {
		const swiper = new Swiper('.indicators', {
			speed: 400,
			spaceBetween: 10,
			slidesPerView: 'auto'
		});
	})
	
	
</script>

<style lang="scss" scoped>

	.indicators {
		padding: 15px;
	}
	.indicators_items {
		background: #fff;
		padding: 9px;
		padding-top: 6px;
		border-radius: 5px;
		width: 112px;
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
		font-size: 14px;
		font-weight: 600;
		line-height: 24px;
		margin-bottom: 3px;
	}
</style>