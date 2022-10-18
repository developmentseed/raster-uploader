import { createApp } from 'vue'
import * as VueRouter from 'vue-router'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

import App from './App.vue'

import std from './std.js';
std();

const router = new VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: () => import('./components/Home.vue') },

        { path: '/login', name: 'login', component: () => import('./components/Login.vue') },
        { path: '/login/forgot', name: 'forgot', component: () => import('./components/Forgot.vue') },
        { path: '/login/verify', name: 'verify', component: () => import('./components/Verify.vue') },
        { path: '/login/reset', name: 'reset', component: () => import('./components/Reset.vue') },
        { path: '/login/register', name: 'register', component: () => import('./components/Register.vue') },

        { path: '/upload', name: 'newupload', component: () => import('./components/Upload.vue') },
        { path: '/upload/:uploadid', name: 'upload', component: () => import('./components/Uploaded.vue') },

        { path: '/basemap', name: 'basemaps', component: () => import('./components/BaseMaps.vue') },
        { path: '/basemap/new', name: 'newbasemap', component: () => import('./components/BaseMap.vue') },
        { path: '/basemap/:basemapid', name: 'basemap', component: () => import('./components/BaseMap.vue') },

        { path: '/source', name: 'sources', component: () => import('./components/Sources.vue') },
        { path: '/source/new', name: 'newsource', component: () => import('./components/Source.vue') },
        { path: '/source/:sourceid', name: 'source', component: () => import('./components/Source.vue') },

        { path: '/collection', name: 'collections', component: () => import('./components/Collections.vue') },
        { path: '/collection/new', name: 'newcollection', component: () => import('./components/Collection.vue') },
        { path: '/collection/:collectionid', name: 'collection', component: () => import('./components/Collection.vue') },

        { path: '/profile', name: 'profile', component: () => import('./components/Profile.vue') },

        { path: '/admin', name: 'admin', component: () => import('./components/Admin.vue') },

        { path: '/.*', name: 'lost', component: () => import('./components/Lost.vue') }
    ]
});

window.api = window.location.origin

import StdButton from './components/std/Button.vue';

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.component('StdButton', StdButton);
app.mount('#app');
