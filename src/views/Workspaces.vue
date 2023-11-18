<template>
	<ion-page>
		<ion-content class='ion-padding'>
			<div class='center aic' style='height: 100%' v-if='!processing'>
				<div style='width: 90%'>
					<h1 class='tac'>Choose your space</h1>

					<ion-select
						v-model='workspace'
						label='Select space'
						placeholder='space'
					>
						<ion-select-option v-for='item in workspaces' :value='item.id'>
							{{ item.name }}
						</ion-select-option>
					</ion-select>

					<div v-if='error' class='text-center text-error text-fs-small'>{{ error }}
						<ion-button size='small' class='finmars-button-text' @click='init()'>Retry</ion-button>
					</div>

					<IonButton expand='full' @click='setWorkspace()'>SELECT</IonButton>
				</div>
			</div>

			<div v-if='processing' class='display-flex align-center justify-center height-100'>
				<progress-circular diameter='90'></progress-circular>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import { IonButton, IonContent, IonPage, IonSelect, IonSelectOption } from '@ionic/vue'
	import { ref } from 'vue'
	import { Preferences } from '@capacitor/preferences'
	import useApi from '@/composables/useApi'
	import { useRouter } from 'vue-router'
	import ProgressCircular from '@/components/ProgressCircular.vue'
	import useStore from '@/composables/useStore.js'
	import formbricks from "@/services/formbricks";
	import initFormbricks from '@/services/formbricks'

	const router = useRouter()
	const workspaces = ref([])
	const workspace = ref(null)
	const error = ref(null)
	const processing = ref(false)

	init()

	async function fetchUser() {
		let result = await useApi('user.get')
		return result
	}



	async function init() {

		error.value = null

		processing.value = true

		let { results } = await useApi('masterUser.get')

		processing.value = false

		if (!results) {
			error.value = `Can't get Spaces`
			return false
		} else {
			workspace.value = results[0].id
		}

		workspaces.value = results

		const user = await fetchUser()

		await initFormbricks(user);


		await Preferences.remove({
			key: 'activeSpaceCode',
		})

		await Preferences.remove({
			key: 'activeSpaceName',
		})

		let store = useStore()
		store.activeSpace = null
		store.activeSpaceName = null
		store.activeSpaceCode = null


	}

	async function setWorkspace() {
		if (!workspace.value) return false

		let workspaceObj = workspaces.value.find((o) => o.id == workspace.value)

		await Preferences.set({
			key: 'activeSpaceCode',
			value: workspaceObj.base_api_url
		})

		await Preferences.set({
			key: 'activeSpaceName',
			value: workspaceObj.name
		})

		let store = useStore()
		store.activeSpace = workspaceObj
		store.activeSpaceName = workspaceObj.name
		store.activeSpaceCode = workspaceObj.base_api_url

		await router.push('/main/dashboard')

		// window.location.href =
		// 	window.location.origin + router.options.history.base + '/main'
	}
</script>

<style lang='scss' scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		//--background: #fafafa;
		//--background: ;
	}

</style>
