<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%">
					<h1 class="tac">Choose your space</h1>

					<ion-select
						v-model="workspace"
						label="Select space"
						placeholder="space"
					>
						<ion-select-option v-for="item in workspaces" :value="item.id">
							{{ item.name }}
						</ion-select-option>
					</ion-select>

					<IonButton expand="full" @click="setWorkspace()">SELECT</IonButton>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import {
		IonPage,
		IonContent,
		IonIcon,
		IonButtons,
		IonButton,
		IonFooter,
		IonSelect,
		IonSelectOption,
	} from '@ionic/vue'
	import { ref } from 'vue'
	import { Preferences } from '@capacitor/preferences'
	import useApi from '@/composables/useApi'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const workspaces = ref([])
	const workspace = ref(null)

	init()
	async function init() {
		let { results } = await useApi('masterUser.get')

		if (!results) return false

		workspaces.value = results
	}

	async function setWorkspace() {
		if (!workspace.value) return false

		let workspaceObj = workspaces.value.find((o) => o.id == workspace.value)

		await Preferences.set({
			key: 'workspace',
			value: workspaceObj.base_api_url,
		})

		window.location.href =
			window.location.origin + router.options.history.base + '/main'
	}
</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}
	ion-content {
		--background: #fafafa;
	}
</style>
