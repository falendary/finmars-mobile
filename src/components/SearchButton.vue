<template>

	<div @click="openSearchDialog($event)" class="search-button-wrap">
		<ion-icon :icon="icons.searchOutline" />
		<ion-label>Search</ion-label>
	</div>

	<search-dialog
		@resultSelectCallback="submitSearchResult"
		:isOpen="isSearchDialogOpen"
		@close="closeSearchDialog($event)"
	></search-dialog>

</template>

<script>
	import {
		IonIcon,
		IonLabel,
		IonTabButton,
	} from '@ionic/vue'

	import {
		searchOutline,
	} from 'ionicons/icons'

	import SearchDialog from '@/views/dialogs/SearchDialog.vue'
	import useStore from '@/composables/useStore.js'
	import { computed } from 'vue'

	export default {
		components: {
			SearchDialog,

			IonTabButton,
			IonLabel,
			IonIcon,


		},

		data() {
			return {

				reportType: '',
				spaceStore: null,
				store: null,
				isSearchDialogOpen: false,

				icons: {

					searchOutline
				}

			}
		},
		methods: {

			openSearchDialog() {
				this.isSearchDialogOpen = true
			},
			closeSearchDialog() {
				this.isSearchDialogOpen = false
			},
			async submitSearchResult(data) {

				console.log('submitSearchResult', data);

				this.isSearchDialogOpen = false

				this.spaceStore.searchQuery = data.query;
				this.spaceStore.searchType = data.type;
				this.spaceStore.searchResult = data.result;

				if (data.type === 'balance' || data.type === 'pnl') {
					this.$router.push(`/main/${data.type}?tab=${data.result['portfolio.user_code']}`)
				} else if (data.type === 'transaction') {
					this.$router.push(`/main/${data.type}`)
				}

			}
		},
		async created() {

			this.store = useStore()
			this.spaceStore = computed(() => this.store.getActiveSpaceStore())



		},
		beforeUnmount() {

		}
	}

</script>


<style lang="scss" scoped>

	.search-button-wrap {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

</style>
