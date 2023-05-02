<template>
	<div class="transactions">
		<div
			v-for="item in items"
      :key="item.id"
		>
      <div
        class="transactions_item"
        :class="{active: openDescId == item.id}"
        @click="openDescId = item.id == openDescId ? null : item.id"
      >
        <div class="pi_first_line flex aic sb">
          <div class="ti_date">{{ dayjs(item.date).format('DD MMM YYYY') }}</div>
          <div class="ti_header">{{ item.top_info }}</div>
        </div>

        <div class="flex sb">
          <div>{{ item.name }}</div>
          <div class="pos" v-if="item.pos"><span class="plus">{{ $format(item.pos) }}</span> POS</div>
        </div>
        <div class="flex sb">
          <div class="name">{{ item.description }}</div>
          <div class="pos" v-if="item.amount"><span class="plus">{{ $format(item.amount) }}</span> USD</div>
        </div>
      </div>

      <div class="transactions_desc_block" v-if="openDescId == item.id">
        <div class="tdb_row flex sb">
          <div class="tdb_prop">Purpose:</div>
          <div class="tdb_value">Coupon</div>
        </div>
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

  let openDescId = ref(null)

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
    transition: 0.3s;
    &.active {
      background: rgba(255, 138, 0, 0.2);
    }
    & + & {
      border-top: 1px solid rgba(224, 224, 224, 1);
    }
  }
  .transactions_desc_block {
    padding: 15px 13px;
    background: #fff;
    border-top: 1px solid rgba(224, 224, 224, 1);
    border-bottom: 1px solid rgba(224, 224, 224, 1);
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
  .tdb_row + .tdb_row {
    margin-top: 4px;
  }
  .tdb_prop {
    font-size: 14px;
    line-height: 16px;
    color: #747474;
  }
  .tdb_value {
    font-size: 14px;
    line-height: 16px;
    text-align: right;
  }
</style>