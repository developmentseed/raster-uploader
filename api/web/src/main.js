import { createApp } from 'vue'
import * as VueRouter from 'vue-router'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

import App from './App.vue'

import std from './std.js';
std();

import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Lost from './components/Lost.vue';
import Forgot from './components/Forgot.vue';
import Verify from './components/Verify.vue';
import Register from './components/Register.vue';
import Reset from './components/Reset.vue';
import Profile from './components/Profile.vue';
import Admin from './components/Admin.vue';
import Upload from './components/Upload.vue';
import Uploaded from './components/Uploaded.vue';
import BaseMaps from './components/BaseMaps.vue';
import BaseMap from './components/BaseMap.vue';
import Sources from './components/Sources.vue';
import Source from './components/Source.vue';
import Collections from './components/Collections.vue';
import Collection from './components/Collection.vue';

const router = new VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: Home },

        { path: '/login', name: 'login', component: Login },
        { path: '/login/forgot', name: 'forgot', component: Forgot },
        { path: '/login/verify', name: 'verify', component: Verify },
        { path: '/login/reset', name: 'reset', component: Reset },
        { path: '/login/register', name: 'register', component: Register },

        { path: '/upload', name: 'newupload', component: Upload },
        { path: '/upload/:uploadid', name: 'upload', component: Uploaded },

        { path: '/basemap', name: 'basemaps', component: BaseMaps },
        { path: '/basemap/new', name: 'newbasemap', component: BaseMap },
        { path: '/basemap/:basemapid', name: 'basemap', component: BaseMap },

        { path: '/source', name: 'sources', component: Sources },
        { path: '/source/new', name: 'newsource', component: Source },
        { path: '/source/:sourceid', name: 'source', component: Source },

        { path: '/collection', name: 'collections', component: Collections },
        { path: '/collection/new', name: 'newcollection', component: Collection },
        { path: '/collection/:collectionid', name: 'collection', component: Collection },

        { path: '/profile', name: 'profile', component: Profile },

        { path: '/admin', name: 'admin', component: Admin },

        { path: '/.*', name: 'lost', component: Lost }
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
