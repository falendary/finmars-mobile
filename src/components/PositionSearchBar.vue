<template>
	<div class="position-search-bar">

		<ion-searchbar :value="spaceStore.searchQuery"
									 show-clear-button="never"
									 @ionFocus="openSearchDialog($event)" show-cancel-button="always"
									 @ionCancel="clearSearchResult()"
									 ></ion-searchbar>

		<search-dialog
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
		IonSearchbar,
		IonSelect,
		IonSelectOption
	} from '@ionic/vue'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import { computed, Suspense } from 'vue'
	import useStore from '@/composables/useStore.js'
	import Passcode from '@/components/Passcode.vue'
	import SearchDialog from '@/views/dialogs/SearchDialog.vue'
	import { closeOutline } from 'ionicons/icons'

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
			IonSelectOption,
			IonSearchbar
			// settingsSharp, close, barChartOutline, layersOutline, readerOutline, settingsOutline
		},
		props: {},
		data() {
			return {
				icons: {
					closeOutline
				},
				store: null,
				spaceStore: null,
				isSearchDialogOpen: false
			}
		},
		emits: ['queryChange'],
		methods: {
			closeSearchDialog() {
				this.isSearchDialogOpen = false
				this.$emit('queryChange', null)
			},
			openSearchDialog() {
				this.isSearchDialogOpen = true
			},
			async submitSearchResult(data) {

				this.isSearchDialogOpen = false

				this.spaceStore.searchQuery = data.query
				this.spaceStore.searchType = data.type
				this.spaceStore.searchResult = data.result

				if (data.type === 'balance' || data.type === 'pnl') {

					this.spaceStore.activeTab = data.result['portfolio.user_code'];
					this.$router.push(`/main/${data.type}`)

				} else if (data.type === 'transaction') {

					this.$router.push(`/main/${data.type}`)

				}

			},
			async clearSearchResult() {

				this.spaceStore.searchQuery = ''
				this.spaceStore.searchType = ''
				this.spaceStore.searchResult = null

				// console.log('clearSearchResult.searchResult', this.spaceStore.searchResult)

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

	.position-search-bar {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.clear-search-result-icon-button {
		margin-right: .5rem;
		margin-top: 0;
	}

</style>
