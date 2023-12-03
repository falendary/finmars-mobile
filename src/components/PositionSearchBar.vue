<template>
	<div class="position-search-bar">

		<ion-searchbar :value="query" @ionFocus="openSearchDialog($event)" show-cancel-button="never"
									 show-clear-button="never"></ion-searchbar>

		<search-dialog
			:report-type="reportType"
			:query="query"
			:portfolios="portfolios"
			@resultSelectCallback="submitSearchResult"
			:isOpen="isSearchDialogOpen"
			@close="closeSearchDialog()"
		></search-dialog>

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
	import SearchDialog from '@/views/dialogs/SearchDialog.vue'

	export default {
		components: {
			SearchDialog,
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
			reportType: {
				type: String,
				required: true
			},
			portfolios: {
				type: Array,
				required: true
			}
		},
		data() {
			return {
				icons: {},
				store: null,
				spaceStore: null,
				isSearchDialogOpen: false,
				query: ''
			}
		},
		emits: ['queryChange'],
		methods: {
			closeSearchDialog() {
				this.isSearchDialogOpen = false
				this.query = ''
				this.$emit('queryChange', null)
			},
			openSearchDialog() {
				this.isSearchDialogOpen = true
			},
			async submitSearchResult(item) {

				this.query = item.name
				this.isSearchDialogOpen = false

				this.$emit('queryChange', item)
			}

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

	.period-type-picker {
		font-size: 1rem;
	}

</style>
