<template>
  <ion-page>
    <ion-content>
      <div class="header flex sb aic">
        <div>All Portfolios</div>
        <div class="header_info">2023-03-16</div>
      </div>

      <div class="main_chart">
        <div class="main_chart_h">Net Asset Value (NAV) </div>
        <div class="main_chart_price">126,342.12 USD</div>

        <div style="height: 80px;width: calc(100% + 10px);margin: 0 0 -5px -5px;">
          <canvas id="lineChart"><p>Chart</p></canvas>
        </div>
      </div>

			<Indicators 
        :items="[
          {id: 1, name: 'Daily p/l', price: 1234, currency: 'USD', percent: -1.56},
          {id: 2, name: 'Month to date (MTD) P\L', price: 456, currency: 'USD', percent: 99.88},
          {id: 3, name: 'Daily p/l', price: 1234, currency: 'USD', percent: 0},
          {id: 4, name: 'Daily p/l', price: 1234, currency: 'USD', percent: 2.56},
        ]"
      />

			<div class="header flex aic sb">
        Balance
        <ion-checkbox labelPlacement="end">Label at the End</ion-checkbox>
      </div>

			<swiper :pagination="true" :modules="[Pagination]" class="balance_swiper"
        :loop="true"
        @slideChange="onBalanceChange"
      >
				<swiper-slide v-for="item in categories">
					<div class="balance_block">
            
						<div class="bb_header_line flex sb aic">
							<div class="bb_header">{{ item.name }}</div>
							<div class="bb_price">{{ $format(item.total) }} USD</div>
						</div>

						<div class="flex sb">
							<div style="width: 145px;height: 145px;">
								<canvas id="balanceChart"><p>Chart</p></canvas>
							</div>

							<div class="balance_labels">
								<div class="balance_labels_item flex aic">
									<div class="balance_labels_percent">81%</div>
									<div class="balance_labels_text">USD</div>
								</div>
                <div class="balance_labels_item flex aic">
									<div class="balance_labels_percent">81%</div>
									<div class="balance_labels_text">big assets title</div>
								</div>
							</div>
						</div>
					</div>
				</swiper-slide>
			</swiper>
    </ion-content>
  </ion-page>
</template>

<script setup>

	import { onMounted } from 'vue'

	import dayjs from 'dayjs'
  import {
    IonCheckbox,
  } from '@ionic/vue';
	import {
		Chart,
		PointElement,
		ArcElement,
		DoughnutController,
		LineController,
    LineElement,
		LinearScale,
		PieController,
		CategoryScale,
		Filler,
		Legend,
		Tooltip,
	} from 'chart.js'

  import Indicators from '@/components/Indicators.vue'

	import { Swiper, SwiperSlide } from 'swiper/vue';
	import { Pagination } from 'swiper';

	Chart.register(
    LineElement,
		PointElement,
		ArcElement,
		DoughnutController,
		LineController,
		PieController,
		CategoryScale,
		LinearScale,
		Filler,
		Legend,
		Tooltip,
	);

	let lineChart
	let balanceChart
	let width, height, gradient

  let data = {
		labels: [],
		datasets: [
			{
				data: [],
				hoverOffset: 4
			},
			{
				data: [],
				circumference: 180
			}
		],
	}
  let categories = [
   {
      name: 'Assets',
      total: 124456,
      instruments: [
        {name: 'usd', total: 455},
        {name: 'eur', total: 455},
        {name: 'chf', total: 455},
        {name: 'UAH', total: 455},
      ]
    },
    {
      name: 'Currency',
      total: 234456,
      instruments: [
        {name: 'usd', total: 455},
        {name: 'eur', total: 455},
        {name: 'chf', total: 455},
        {name: 'UAH', total: 455},
      ]
    },
    {
      name: 'Sector',
      total: 14456,
      instruments: [
        {name: 'usd', total: 455},
        {name: 'eur', total: 455},
        {name: 'chf', total: 455},
        {name: 'UAH', total: 455},
      ]
    },
  ]

  onMounted(() => {
    createChart()
  })

  function onBalanceChange(swiper) {
    let prev = swiper.previousIndex
    let active = swiper.activeIndex
    let prevChart = swiper.slides[prev].querySelector('#balanceChart')
    let nextChart = swiper.slides[active].querySelector('#balanceChart')

    let newDiv = document.createElement('div')
    newDiv.id = 'balanceChart'
    
    prevChart.parentNode.append(newDiv)
    nextChart.parentNode.replaceChild(prevChart, nextChart )
  }

  function createChart() {
		balanceChart = new Chart('balanceChart', {
			type: 'doughnut',
			data: data,
			options: {
				cutout: '35%',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
            display: false
					},

					tooltip: {
						callbacks: {
							label: function(context) {
								let labelIndex = context.dataIndex

								if ( context.datasetIndex === 1 ) {
									labelIndex = context.chart.data.datasets[0].data.length + labelIndex
								}

								return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
							}
						}
					}
				}
			},
		});

		lineChart = new Chart('lineChart', {
			type: 'line',
			data: {
        labels: ['test', 'test2', 'test2', 'test2', 'test2', 'test', 'test2', 'test2', 'test2', 'test2'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [23, 35, 38, 140, 12, 7,13, 15,20, 30,],
            borderColor: '#F05A22',
            borderWidth: 1,
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            backgroundColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;

              if (!chartArea) {
                // This case happens on initial chart load
                return;
              }

              const chartWidth = chartArea.right - chartArea.left;
              const chartHeight = chartArea.bottom - chartArea.top;
              if (!gradient || width !== chartWidth || height !== chartHeight) {
                // Create the gradient because this is either the first render
                // or the size of the chart has changed
                width = chartWidth
                height = chartHeight;
                gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'rgba(255, 178, 108, 0)');
                gradient.addColorStop(1, 'rgba(240, 90, 34, 0.48)');
              }
              return gradient
            },
            fill: true
          },
          {
            label: 'Dataset 1',
            data: [20, 30, 35, 40, 20, 35, 20, 10, 13, 30,],
            borderColor: 'rgba(30, 30, 30, 0.2)',
            borderWidth: 1,
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            stepped: true
          }
        ],
      },
			options: {
        layout: {
        },
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.5
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          }
        }
			},
		});

    data.labels = ['test', 'test']
    data.datasets = [
      {
        data: [1,2,3,4,6],
        hoverOffset: 4
      },
      {
        data: [-1, -5],
        circumference: 12 == 0
          ? 360
          : Math.floor(6 / 16 * 360)
      }
    ]
    balanceChart.update()
	}
</script>

<style lang="scss" scoped>
	.header {
    color: #747474;
		padding: 0 15px;
    font-weight: 500;
    font-size: 20px;
    margin-bottom: 15px;
  }
	
  .header_info {
    font-size: 16px;
  }
	.main_chart {
    background: #fff;
		margin: 0 15px;
    padding-top: 9px;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.05);

    &_h {
      padding: 0 14px;
      padding-bottom: 4px;
      font-size: 14px;
      line-height: 24px;
      color: #747474;
    }
    &_price {
      padding: 0 14px;
      padding-bottom: 50px;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
    }
  }
  ion-content {
    --padding-top: 10px;
    --padding-bottom: 10px;
    --background: #FAFAFA;
  }
  .balance_block {
    margin: 0 15px;
    padding: 15px 13px;
    background: #fff;
    border-radius: 5px;
  }
  .bb_header {
    font-size: 20px;
    line-height: 24px;
    color: #747474;
  }
  .bb_price {
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
  }
  .bb_header_line {
    margin-bottom: 25px;
  }
  .balance_block {
    margin-bottom: 15px;
  }
  .balance_labels_item {
    & + & {
      margin-top: 15px;
    }
  }
  .balance_labels_percent {
    padding: 3px 9px;
    background: #747474;
    color: #fff;
    border-radius: 5px;
    margin-right: 6px;
  }
  .balance_labels_text {
    font-size: 16px;
    line-height: 24px;
    color: #747474;
  }
</style>
