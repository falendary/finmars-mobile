<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%">
				<div style="width: 90%" class="login-holder">
					<h1 class="tac">{{ title }}</h1>

					<p v-if="subtitle" class="tac login-subtitle">
						{{ subtitle }}
					</p>

					<div style="display:flex; align-items: center; justify-content: center; width: 100%;">
						<ion-button
							class="global-process-close-button"
							@click="goToRegionSelect"
							:disabled="loading"
						>
							Region Select
						</ion-button>
					</div>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
	import { ref } from "vue"
	import { useRouter } from "vue-router"
	import { IonButton, IonContent, IonPage, onIonViewWillEnter } from "@ionic/vue"
	import { bootstrapSession, routeAfterAuth, startLoginFlow } from "@/services/authService.js"

	const router = useRouter()

	const loading = ref(false)
	const title = ref("Signing in")
	const subtitle = ref("Checking your session")

	async function goToRegionSelect() {
		await router.replace("/welcome")
	}

	async function runAuthFlow() {
		if (loading.value) return

		loading.value = true
		title.value = "Signing in"
		subtitle.value = "Checking your session"

		try {
			const result = await bootstrapSession()

			if (result.status === "authenticated") {
				subtitle.value = "Opening your workspace"
				await routeAfterAuth(router)
				return
			}

			if (result.status === "needs-login") {
				subtitle.value = "Redirecting to login"
				await startLoginFlow()
				return
			}

			console.error("login.runAuthFlow unexpected result", result)
			title.value = "Login unavailable"
			subtitle.value = "Please select region again"
			await router.replace("/welcome")
		} catch (error) {
			console.error("login.runAuthFlow failed", error)
			title.value = "Login unavailable"
			subtitle.value = "Please select region again"
			await router.replace("/welcome")
		} finally {
			loading.value = false
		}
	}

	onIonViewWillEnter(() => {
		runAuthFlow()
	})
</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		--background: var(--ion-card-background);
	}

	.login-subtitle {
		margin-top: 12px;
		opacity: 0.8;
		font-size: 0.95rem;
	}
</style>
