<template>
	<div class="passcode-component-wrapper">
		<vue-particles
			id="tsparticles"
			:particlesInit="particlesInit"
			:options="{
									fpsLimit: 120,

                    particles: {
                        collisions: {
                            enable: true
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800
                            },
                            value: 80
                        },
                        shape: {
                            type: 'circle'
                        }
                    },

										preset: 'stars',
										detectRetina: true,
										 emitters: {
												direction: 'none',
										}
									}"
		/>


		<div class="passcode-container">

			<p class="passcode-title">Passcode</p>

			<div class="passcode-display">
				<div
					v-for="n in 4"
					:key="n"
					:class="['passcode-digit', { filled: n <= passcode.length }, {'wrong-passcode': isWrongPasscode, 'right-passcode': isRightPasscode} ]"
				></div>
			</div>

			<div class="buttons-grid">
				<button v-for="n in 9" :key="n" class="passcode-button" @touchend="addDigit(n)">{{ n }}</button>
				<button class="passcode-button-clear" @click="logout()">Logout</button>
				<button class="passcode-button" @click="addDigit(0)">0</button>
				<button class="passcode-button-clear" @click="onAuthenticate()">

					<ion-icon :icon="icons.fingerPrintOutline" />

				</button>
			</div>

		</div>

	</div>
</template>

<script>
	import { alertController, IonButton, IonContent, IonIcon, IonPage, } from '@ionic/vue'

	import { fingerPrintOutline } from 'ionicons/icons'

	import { loadStarsPreset } from 'tsparticles-preset-stars'
	import { Preferences } from '@capacitor/preferences'

	import { Haptics, ImpactStyle } from '@capacitor/haptics'
	import {
		BiometricAuth,
		BiometryErrorType,
		BiometryType,
		getBiometryName,
	} from '@aparajita/capacitor-biometric-auth'

	import { Capacitor } from '@capacitor/core'
	import { toRaw } from 'vue'


	export default {
		components: {
			IonIcon,
			IonButton, IonContent, IonPage
		},

		data() {
			return {
				passcode: '',
				isWrongPasscode: false,
				isRightPasscode: false,
				biometryTypes: [
					{
						title: 'None',
						type: BiometryType.none
					},
					{
						title: 'Touch ID',
						type: BiometryType.touchId
					},
					{
						title: 'Face ID',
						type: BiometryType.faceId
					},
					{
						title: 'Fingerprint Authentication',
						type: BiometryType.fingerprintAuthentication
					},
					{
						title: 'Face Authentication',
						type: BiometryType.faceAuthentication
					},
					{
						title: 'Iris Authentication',
						type: BiometryType.irisAuthentication
					}
				],
				biometry: null,
				biometryOptions: null,
				biometryType: null,
				appListener: null,
				isNative: Capacitor.isNativePlatform(),
				isIOS: Capacitor.getPlatform() === 'ios',
				isAndroid: Capacitor.getPlatform() === 'android',
				icons: {
					fingerPrintOutline
				},
				attempts: 0,
				maxAttempts: 3
			}
		},
		computed: {
			biometryName() {

				if (this.isNative) {
					if (this.biometry.biometryTypes.length === 0) {
						return 'No biometry'
					}

					if (this.biometry.biometryTypes.length === 1) {
						return getBiometryName(this.biometry.biometryType)
					}

					return 'Biometry'
				} else {
					return getBiometryName(this.biometry.biometryType) || 'No biometry'
				}

			},
			biometryDescription() {

				let description

				if (this.isNative) {
					if (this.biometry.biometryTypes.length > 0) {
						description = `${this.biometry.biometryTypes
							.map((type) => getBiometryName(type))
							.join(' and ')} ${
							this.biometry.value.biometryTypes.length === 1 ? 'is' : 'are'
						} supported`
					} else {
						description = 'No biometry is supported'
					}
				} else {
					description = `${this.biometryName.value} is supported`
				}

				if (this.biometry.biometryType !== BiometryType.none) {
					if (this.biometry.isAvailable) {
						description += ` and ${
							this.biometry.biometryTypes.length > 1 ? 'potentially ' : ''
						}available.`
					} else {
						description += ', but not available.'
					}

					if (this.biometry.reason) {
						description += ` ${this.biometry.reason} (${this.biometry.code})`
					}
				} else {
					description += '.'
				}

				return description

			}
		},
		methods: {

			async addDigit(digit) {

				await Haptics.impact({ style: ImpactStyle.Heavy });

				if (this.passcode.length < 4) {
					this.passcode += digit
				}
				if (this.passcode.length === 4) {
					// Validate or use the passcode here.
					// console.log('Passcode entered:', this.passcode)

					if (this.savedPasscode === this.passcode) {

						this.isRightPasscode = true

						setTimeout(() => {
							this.$emit('verified')
						}, 500)

					} else {

						await Haptics.vibrate();

						this.attempts = this.attempts + 1;

						if (this.attempts >= this.maxAttempts) {
							this.logout()
							this.$emit('verified')
						}

						this.passcode = ''
						this.isWrongPasscode = true
						// Reset after the animation duration
						setTimeout(() => {
							this.isWrongPasscode = false
						}, 500)

					}


				}
			},
			clearLast() {
				this.passcode = this.passcode.slice(0, -1)
			},
			clearAll() {
				this.passcode = ''
			},
			logout() {
				this.$router.push('/logout')
			},

			savePasscode() {

				Preferences.set({
					key: 'passcode',
					value: this.passcode
				})

				this.$router.push('/main/dashboard')

			},

			async particlesInit(engine) {
				//await loadFull(engine);
				await loadStarsPreset(engine)
			},

			async showAlert(message) {
				const alert = await alertController.create({
					header: `${this.biometryName} says:`,
					subHeader: '',
					message,
					buttons: ['OK'],
				})
				await alert.present()
			},

			async showErrorAlert(error){
				await this.showAlert(`${error.message} [${error.code}].`)
			},


			async onAuthenticate() {

				// console.log('this.biometry', this.biometry);
				// console.log('this.biometryOptions', this.biometryOptions);

				try {
					// options is a reactive proxy, we can't pass it directly to a plugin.
					// so pass the underlying object.
					await BiometricAuth.authenticate(toRaw(this.biometryOptions))
					// await showAlert('Authorization successful!')

					this.isRightPasscode = true

					setTimeout(() => {
						this.$emit('verified')
					}, 500)

				} catch (error) {
					// console.log('error', error);
					// Someday TypeScript will let us type catch clauses...
					// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
					// await this.showErrorAlert(error)
				}

			},

			async updateBiometryInfo(info) {

				// console.log('updateBiometryInfo.info', info);

				this.biometry = info
			}

		},
		async created() {

			let { value: savedPasscode } = await Preferences.get({ key: 'passcode' })

			this.savedPasscode = savedPasscode

			this.passcode = ''

			this.biometryType = BiometryType.none
			this.biometry = {
				isAvailable: false,
				biometryType: BiometryType.none,
				biometryTypes: [BiometryType.none],
				reason: '',
				code: BiometryErrorType.none
			}


			this.biometryOptions = {
				reason: '',
				cancelTitle: '',
				iosFallbackTitle: '',
				androidTitle: '',
				androidSubtitle: '',
				allowDeviceCredential: false,
				androidConfirmationRequired: true
			}

			await this.updateBiometryInfo(await BiometricAuth.checkBiometry())


			// console.log('created.updateBiometryInfo', this.biometry)

			try {
				this.appListener = await BiometricAuth.addResumeListener(this.updateBiometryInfo)

				// console.log('created.appListener', this.appListener)

			} catch (error) {
				if (error instanceof Error) {
					console.error(error.message)
				}
			}

			if (this.biometry.isAvailable) {
				await this.onAuthenticate();
			}

		},
		async onBeforeUnmount() {
			await this.appListener.remove()
		}

	}

</script>

<style lang="scss">

	.passcode-component-wrapper {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: 1;
		background: #000;
		overflow: auto;
	}

	ion-button {
		margin-top: 20px;
	}

	.passcode-component {
		--background: trasparent;
		background: transparent;
		color: #fff;
		position: relative;
	}

	ion-content {
		//--background: #fafafa;
		--background: #eff4f7;
	}


	.passcode-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		position: relative;
		min-height: 100%;
		justify-content: flex-end;
	}

	.passcode-display {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.passcode-digit {
		width: 20px;
		height: 20px;
		background-color: #333;
		border-radius: 50%;
		transition: background-color .5s;
	}

	.passcode-digit.filled {
		background-color: #eee;
	}

	.passcode-title {
		width: 100%;
		text-align: center;
	}

	.passcode-display {
		top: 5.5rem;
	}

	.buttons-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.passcode-button {
		background: rgba(255, 255, 255, 0.045);
		border-radius: 50%;
		padding: 1rem 1.5rem;
		font-weight: 200;
		color: #fff;
		//border: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 3rem;
		transition: background-color 0.3s, transform 0.1s;

		&:active {
			background-color: #eee; /* or any color to indicate the touch */
			transform: scale(0.95); /* Slight scale down to give a "pressed" feel */
		}
	}

	/* If you want to give more touch feedback for touch devices */
	@media (hover: none) {
		.passcode-button:active {
			background-color: #eee;
			box-shadow: none; /* You can remove any box shadows if there are any */
		}
	}

	.passcode-button-clear {
		background: transparent;
		font-size: 0.9rem;
		color: #fff;

		ion-icon {
			font-size: 3rem;
		}
	}

	.passcode-digit.right-passcode {
		background-color: green;
		opacity: .9;

	}

	.passcode-digit.wrong-passcode {
		background-color: crimson;
		opacity: .9;
		animation: shake 0.5s;
	}


	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-10px);
		}
		50% {
			transform: translateX(10px);
		}
		75% {
			transform: translateX(-10px);
		}
		100% {
			transform: translateX(0);
		}
	}


</style>
