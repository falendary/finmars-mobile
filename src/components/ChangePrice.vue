<template>
  <div class="ii_change flex aic"
		:class="{
			plus: percent > 0,
			neutral: percent == 0,
			minus: percent < 0,
		}"
	>
		<img v-if="percent < 0" src="/img/change_down.svg" alt="">
		<img v-if="percent > 0" src="/img/change_up.svg" alt="">

		<div class="li_text">{{ percent }}%</div>
	</div>
</template>

<script setup>

  const props = defineProps({
    percent: Number
  })

</script>

<style lang="scss" scoped>
  .ii_change {
		display: inline-flex;
		height: 25px;
		line-height: 25px;
		border-radius: 15px;
		padding-left: 10px;
		padding-right: 10px;
		font-size: 12px;
		&.plus {
			background: rgba(52, 199, 89, 0.17);
			color: rgba(52, 199, 89, 1);
		}
		&.minus {
			background: var(--ion-background-color);
			color: #ff2d55;
		}
		&.neutral {
			background: #EFEFEF;
			color: #747474;
		}
	}
	.li_text {
		margin-left: 6px;
	}
</style>
