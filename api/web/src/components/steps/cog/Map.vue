<template>
<div class='col col--12 grid border border--gray-light round mx12 relative'>
    <div id='map' class='w-full h300'></div>

    <div class='absolute top left z5 ml12 mt12'>
        <button @click='menu = !menu' class='btn round btn--stroke bg-white color-gray'>
            <svg class='icon'><use href='#icon-menu'/></svg>
        </button>

        <template v-if='menu'>
            <div class='col col--12 bg-white round mt6 px12 py6'>
                <label class='txt-s txt-underline w-full'>Opacity</label>
                <div class='range range--s'>
                    <input v-model='opacity' type='range' min=0 max=100 />
                </div>

                <label class='txt-s txt-underline w-full'>BaseMaps</label>
                <div @click='setBase(b)' :key='b.id' v-for='b of basemap.basemap' class='col col--12 cursor-pointer bg-gray-light-on-hover round'>
                    <div v-text='b.name' class='txt-s align-center w-full'></div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
    name: 'StepCogMap',
    props: {
        step: Object,
        info: Object
    },
    data: function() {
        return {
            map: false,
            meta: {},
            menu: false,
            opacity: 100,
            loading: {
                basemap: false
            },
            basemap: {
                total: 0,
                basemap: []
            }
        }
    },
    mounted: async function() {
        this.getBasemaps();

        const res = await window.std('/api/map');
        mapboxgl.accessToken = res.token;

        this.$nextTick(() => {
            this.init()
        });
    },
    watch: {
        opacity: function() {
             this.map.setPaintProperty(
                 'rasters',
                 'raster-opacity',
                 parseInt(this.opacity) / 100
             );
        }
    },
    methods: {
        init: async function() {
            try {
                let url = new URL(`/api/cog/coord.png`, window.location.origin);
                url.searchParams.append('access', this.info.token)
                url = String(url).replace(/coord.png/, '{z}/{x}/{y}.png');

                this.map = new mapboxgl.Map({
                    container: 'map',
                    style: {
                        version: 8,
                        sources: {
                            'rasters': {
                                type: 'raster',
                                tiles: [ url ],
                                tileSize: 256,
                            },
                        },
                        layers: [{
                            id: 'rasters',
                            type: 'raster',
                            source: 'rasters',
                            minzoom: 0,
                            maxzoom: 22
                        }]
                    },
                });

                this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
            } catch (err) {
                this.$emit('err', err);
            }
        },
        setBase: function(base) {
            this.map.addSource('background', {
                type: 'raster',
                tiles: [ base.url ]
            });
            this.map.addLayer({
                id: 'background',
                type: 'raster',
                source: 'background',
                minzoom: 0,
                maxzoom: 22
            }, 'rasters');
        },
        getBasemaps: async function() {
            try {
                this.loading.basemap = true;
                this.basemap = await window.std(`/api/basemap`);
                this.loading.basemap = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
