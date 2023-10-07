import auth from './middleware/auth.js'

export default [
	{
		path: '/',
		component: () => import('@/views/main/Index.vue'),
		beforeEnter: [auth],
	},
	{
		path: '/welcome',
		component: () => import('@/views/Welcome.vue'),
		beforeEnter: [() => {}],
	},
	{
		path: '/recovery',
		component: () => import('@/views/Recovery.vue'),
		beforeEnter: [() => {}],
	},
	{
		path: '/login',
		component: () => import('@/views/Login.vue'),
		beforeEnter: [() => {}],
	},
	{
		path: '/logout',
		component: () => import('@/views/Logout.vue'),
		beforeEnter: [() => {}],
	},
	{
		path: '/workspaces',
		component: () => import('@/views/Workspaces.vue'),
		beforeEnter: [auth],
	},
	{
		path: '/main',
		component: () => import('@/views/main/Index.vue'),
		beforeEnter: [auth],
		children: [
			{
				path: '',
				redirect: '/main/dashboard',
			},
			{
				path: 'dashboard',
				component: () => import('@/views/main/Dashboard.vue'),
			},
			{
				path: 'balance',
				component: () => import('@/views/main/Balance.vue'),
			},
			{
				path: 'pnl',
				component: () => import('@/views/main/Pnl.vue'),
			},
			{
				path: 'transactions',
				component: () => import('@/views/main/Transactions.vue'),
			},
		],
	},
]
