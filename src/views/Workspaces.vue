<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="center aic" style="height: 100%" v-if="!processing">

				<div v-if="workspaces.length">


					<div>
						<h1 class="tac">Select your Space</h1>

						<ion-select
							v-model="workspace"
							aria-label="Space"
							placeholder="Space"
						>
							<ion-select-option v-for="(item, index) in workspaces" :value="item.id" :key="index">
								{{ item.name }}
							</ion-select-option>
						</ion-select>

						<div v-if="error" class="text-center text-error text-fs-small">{{ error }}
							<ion-button size="small" class="finmars-button-text" @click="init()">Retry</ion-button>
						</div>

						<IonButton expand="full" @click="setWorkspace()">Start</IonButton>
					</div>

				</div>

				<div v-if="!workspaces.length">
					<h1 class="tac">No Spaces Available</h1>
					<p>Please, accept invite via Desktop app</p>
					<p>or contact us <a href="mailto:support@finmars.com">support@finmars.com</a></p>
				</div>
			</div>

			<div v-if="processing" class="display-flex align-center justify-center height-100">
				<progress-circular diameter="90"></progress-circular>
			</div>
		</ion-content>
	</ion-page>
</template>

<script>
	import { IonButton, IonSelect } from '@ionic/vue'
	import { Preferences } from '@capacitor/preferences'
	import useApi from '@/composables/useApi.js'
	import useStore from '@/composables/useStore.js'
	import initFormbricks from '@/services/formbricks.js'

	export default {
		components: { IonButton, IonSelect },

		data() {
			return {
				error: null,
				processing: false,
				workspace: null,
				workspaces: []

			}
		},
		methods: {
			async fetchUser() {
				let user = await useApi('user.get')


				function getCodesFromUrl() {
					var urlPath = window.location.pathname; // Get the path part of the URL
					var pathParts = urlPath.split('/'); // Split by "/"

					// Ensure the path has enough parts to extract realm_code and space_code
					var realmCode = pathParts[1] || null; // The first segment after "/"
					var spaceCode = pathParts[2] || null; // The second segment after "/"

					return { realmCode, spaceCode };
				}

				if (window._paq) {

					var _paq = window._paq = window._paq || [];
					/* tracker methods like "setCustomDimension" should be called before "trackPageView" */



					// Consider more unique id across spaces

					let prefix = 'eu-central'

					if (window.location.href.indexOf('0.0.0.0') !== -1) {
						prefix = 'local'
					}

					let pieces = window.location.host.split('.')

					if (pieces.length === 3) {
						prefix = pieces[0]
					}

					(function() {
						var u="//analytics.finmars.com/";
						_paq.push(['setTrackerUrl', u+'matomo.php']);
						// _paq.push(['setSiteId', prefix]);
						_paq.push(['setSiteId', 1]);

						var codes = getCodesFromUrl();

						// If codes exist, set them as custom dimensions
						if (codes.realmCode && codes.spaceCode) {
							_paq.push(['setCustomDimension', 1, codes.realmCode]); // Set realm_code (Dimension ID 1)
							_paq.push(['setCustomDimension', 2, codes.spaceCode]); // Set space_code (Dimension ID 2)
						}

						_paq.push(['setUserId', user.username]);
						const hash = window.location.hash.substr(3); // Remove the `#`

						var currentUrl = `${location.origin}${location.pathname}${hash}`; // Build the new clean URL

						// _paq.push(['setReferrerUrl', currentUrl]);
						// currentUrl = '/' + window.location.hash.substr(1);
						_paq.push(['setCustomUrl', currentUrl]);
						_paq.push(['trackPageView']);
						_paq.push(['enableLinkTracking']);

						var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
						g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
					})();

				}

				return user
			},
			async getRegion() {
				let { value } = await Preferences.get({ key: 'region' })

				if (!value) return false

				return JSON.parse(value)
			},
			async init() {
				this.error = null

				this.processing = true

				const region = await this.getRegion()

				console.log('region', region)

				if (region && region.domain === 'https://finmars.com') {
					await Preferences.remove({ key: 'region' })
					await Preferences.remove({ key: 'activeRealmCode' })
					await Preferences.remove({ key: 'activeSpaceCode' })
					await Preferences.remove({ key: 'activeSpaceName' })
					await Preferences.remove({ key: 'passcode' })

					window.location.href = '/welcome'
				}

				let data = await useApi('masterUser.get')


				if (!data.results) {
					this.error = `Can't get Spaces`
					return false
				} else {
					console.log('data.results', data.results)
					this.workspaces = data.results

					if (this.workspaces.length) {
						this.workspace = this.workspaces[0].id
					}


				}

				// console.log('Workspaces init', this.workspace)

				const user = await this.fetchUser()

				await initFormbricks(user)


				await Preferences.remove({
					key: 'activeSpaceCode'
				})

				await Preferences.remove({
					key: 'activeRealmCode'
				})

				await Preferences.remove({
					key: 'activeSpaceName'
				})

				let store = useStore()
				store.activeSpace = null
				store.activeSpaceName = null
				store.activeSpaceCode = null
				store.activeRealmCode = null

				this.processing = false


			},
			async setWorkspace() {
				if (!this.workspace) return false

				let workspaceObj = this.workspaces.find((o) => o.id === this.workspace)

				await Preferences.set({
					key: 'activeSpaceCode',
					value: workspaceObj.base_api_url
				})

				if (workspaceObj.realm_code) {
					await Preferences.set({
						key: 'activeRealmCode',
						value: workspaceObj.realm_code
					})
				}

				await Preferences.set({
					key: 'activeSpaceName',
					value: workspaceObj.name
				})

				let store = useStore()
				store.activeSpace = workspaceObj
				store.activeSpaceName = workspaceObj.name
				store.activeSpaceCode = workspaceObj.base_api_url
				store.activeRealmCode = workspaceObj.realm_code

				await this.$router.push('/main/dashboard')

				// window.location.href =
				// 	window.location.origin + router.options.history.base + '/main'
			}
		},
		mounted() {

		},
		async created() {
			await this.init()
		}

	}
</script>

<style lang="scss" scoped>
	ion-button {
		margin-top: 20px;
	}

	ion-content {
		//--background: #fafafa;
		//--background: ;
	}


</style>
