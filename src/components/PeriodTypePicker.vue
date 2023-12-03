<template>
  <div class="period-type-picker">

		<ion-select
			interface="popover"
			v-model="spaceStore.settings.general.period_type"
			@ionChange="periodTypeChange($event.detail.value)"
			placeholder="Period Type"
		>
			<ion-select-option
				v-for="item in periodTypes"
				v-bind:key="item.user_code"
				:value="item.user_code"
			>
				{{ item.name }}
			</ion-select-option>
		</ion-select>

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
		IonSelectOption
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import { bugOutline } from 'ionicons/icons'

	export default {
		components: {
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

		data() {
			return {
				icons: {
				},
				store: null,
				spaceStore: null,
				periodTypes: [
					{
						user_code: 'daily',
						name: 'Daily'
					},
					{
						user_code: 'mtd',
						name: 'MTD'
					},
					{
						user_code: 'qtd',
						name: 'QTD'
					},
					{
						user_code: 'ytd',
						name: 'YTD'
					},
					{
						user_code: 'inception',
						name: 'All Time'
					}
				]
			}
		},
		methods: {
			periodTypeChange(value){

				console.log('periodTypeChange', value);

				this.store.setPeriodType(value)
			}

		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())

			if (!this.spaceStore.settings.general.period_type) {
				this.store.setPeriodType('ytd')
			}

		},
		mounted() {

		},
		beforeUnmount() {

		}
	}

</script>

<style lang="scss" scoped>

	.period-type-picker {
		font-size: 1rem;
	}

</style>
