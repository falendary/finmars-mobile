<template>
	<div class='progress-holder' :class="'progress-size-' + diameter" :style='{background: bg}'>

		<img src='/img/sphere.png' alt=''>

		<div class='progress progress-circular'
				 :class="'front-line-' +frontLineColor + ' back-line-' +backLineColor"
				 :style="{'border-top-color': color, 'border-right-color': color}"
		>


		</div>

	</div>

</template>

<script>

	/**
	 * Created by szhitenev on 30.09.2023.
	 */

	export default {

		props: {
			diameter: {
				type: Number,
				required: true,
				default: 10
			},
			bg: {
				type: String,
				required: false,
				default: 'white'
			}
		},

		data() {
			return {
				progressInterval: null,
				frontLineColor: 'default',
				backLineColor: 'default',
				color: '#F05A22',
				brightColors: [
					'#FF5733', '#FFC300', '#36D7B7', '#3399FF', '#FF33FF', // Original colors
					'#FF6666', '#FF9900', '#66FF66', '#33CCFF', '#FF66CC', // Additional colors
					'#FF9966', '#FFCC00', '#00FF00', '#66CCFF', '#FF66FF',
					'#FFCCCC', '#FFFF00', '#00FF99', '#99CCFF', '#CC33FF',
					'#FFCC99', '#FFFF33', '#33FF33', '#66CCCC', '#CC66FF',
					'#FF9999', '#FFFF66', '#66FFCC', '#99A8FF', '#FF99FF',
					'#FF0000', '#FFCC66', // More colors
					'#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
					'#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
					'#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
					'#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
					'#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
					'#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
					'#FF4500', '#FFD700', // Even more colors
					'#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
					'#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
					'#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
					'#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
					'#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
					'#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
					'#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
					'#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
					'#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
					'#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
					'#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
					'#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
					'#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
					'#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
					'#FF4500', '#FFD700', // More and more colors
					'#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
					'#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
					'#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
					'#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
					'#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
					'#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
					'#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
					'#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
					'#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
					'#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC'
				]
			}
		},

		methods: {
			getRandomBrightColor() {

				const randomIndex = Math.floor(Math.random() * this.brightColors.length)
				return this.brightColors[randomIndex]

			}
		},
		async created() {

			this.progressInterval = setInterval(() => {
				this.color = this.getRandomBrightColor()
			}, 2000)

		},
		beforeUnmount() {
			clearInterval(this.progressInterval)
		}

	}

</script>

<style lang='scss'>

	.progress-size-10 {
		width: 10px;
		height: 10px;
	}
	.progress-size-20 {
		width: 20px;
		height: 20px;
	}
	.progress-size-30 {
		width: 30px;
		height: 30px;
	}
	.progress-size-40 {
		width: 40px;
		height: 40px;
	}
	.progress-size-50 {
		width: 50px;
		height: 50px;
	}
	.progress-size-60 {
		width: 60px;
		height: 60px;
	}
	.progress-size-70 {
		width: 70px;
		height: 70px;
	}
	.progress-size-80 {
		width: 80px;
		height: 80px;
	}
	.progress-size-90 {
		width: 90px;
		height: 90px;
	}
	.progress-size-100 {
		width: 100px;
		height: 100px;
	}

	.progress-holder {
		//background: #fff;
		background: transparent;
		position: relative;
		border-radius: 50%;
		/* border: 1px solid red; */
		text-align: center;
		box-shadow: 0 0 10px rgba(0,0,0,1);
		display: flex;
		justify-content: center;
		align-items: center;

		img {
			width: 75%;
			height: 75%;

			animation: rotateCounterClockwise 20s linear infinite; /* Adjust duration as needed */

		}

		@keyframes rotateCounterClockwise {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(-360deg);
			}
		}

	}


	.progress-circular {
		border: .2em solid transparent;
		//border-top-color: currentcolor;
		border-top-color: #F05A22;
		border-radius: 50%;
		animation: 1s progress-circular linear infinite;
		position: absolute;

		width: 100%;
		height: 100%;
		transition: border-top-color 2s linear, border-right-color 2s linear;

		&:before {
			content: '';
			display: block;
			width: inherit;
			height: inherit;
			position: absolute;
			top: -.2em;
			left: -.2em;
			border: .2em solid currentcolor;
			border-radius: 50%;
			opacity: .2;
		}
	}

	@keyframes progress-circular {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}


	progress-linear {
		width: 100%;
	}

	.progress-linear {
		width: 100%;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		height: 4px;
		color: #AD725D;
		background-color: rgba(33, 150, 243, 0.12);
		font-size: 16px;
		vertical-align: 0;
		display: block;
	}

	.progress-linear::-webkit-progress-bar {
		background-color: transparent;
	}

	/* Determinate */
	.progress-linear::-webkit-progress-value {
		background-color: currentColor;
		transition: all 0.2s;
	}

	.progress-linear::-moz-progress-bar {
		background-color: currentColor;
		transition: all 0.2s;
	}

	.progress-linear::-ms-fill {
		border: none;
		background-color: currentColor;
		transition: all 0.2s;
	}

	/* Indeterminate */
	.progress-linear:indeterminate {
		background-size: 200% 100%;
		background-image: linear-gradient(to right, transparent 50%, currentColor 50%, currentColor 60%, transparent 60%, transparent 71.5%, currentColor 71.5%, currentColor 84%, transparent 84%);
		animation: progress-linear 2s infinite linear;
	}

	.progress-linear:indeterminate::-moz-progress-bar {
		background-color: transparent;
	}

	.progress-linear:indeterminate::-ms-fill {
		animation-name: none;
	}

	@keyframes progress-linear {
		0% {
			background-size: 200% 100%;
			background-position: left -31.25% top 0%;
		}
		50% {
			background-size: 800% 100%;
			background-position: left -49% top 0%;
		}
		100% {
			background-size: 400% 100%;
			background-position: left -102% top 0%;
		}
	}



</style>
