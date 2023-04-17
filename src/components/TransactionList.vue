<template>
	<div class="transactions">
		<div class="transactions_item"
			v-for="item in items"
		>
			<div class="pi_first_line flex aic sb">
				<div class="ti_date">{{ dayjs(item.date).format('DD MMM YYYY') }}</div>
				<div class="ti_header">{{ item.top_info }}</div>
			</div>

      <div class="flex sb">
        <div>{{ item.name }}</div>
        <div class="pos"><span class="plus">{{ $format(item.pos) }}</span> {{ item.pos ? 'POS' : '' }}</div>
      </div>
      <div class="flex sb">
        <div class="name">{{ item.description }}</div>
        <div class="pos"><span class="plus">{{ $format(item.amount) }}</span> USD</div>
      </div>
		</div>
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'
	import { onMounted, ref } from 'vue';

	const props = defineProps({
		items: Array
	})

	onMounted(() => {
		
	})
	
	
</script>

<style lang="scss" scoped>
	.transactions {
    padding: 0 15px;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
  }
  .transactions_item {
    padding: 7px 13px;
    background: #fff;

    & + & {
      border-top: 1px solid rgba(224, 224, 224, 1);
    }
  }
	.ti_header {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #747474;
  }
  .ti_date {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #747474;
  }
  .pos {
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
  }
  .name {
    font-size: 12px;
    line-height: 24px;
  }
  .plus {
    color: rgba(52, 199, 89, 1);
  }
  .minus {
    color: #ff2d55;
  }
  .neutral {
    color: #747474;
  }
</style>