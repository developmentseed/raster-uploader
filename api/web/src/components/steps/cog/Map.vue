<template>
<div class='col col--12 grid border border--gray-light round mx12'>
    <div id='map' class='w-full h300'></div>
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
            meta: {}
        }
    },
    mounted: function() {
        this.$nextTick(() => {
            this.init();
        });
    },
    methods: {
        init: async function() {
            try {
                const res = await window.std('/api/map');
                mapboxgl.accessToken = res.token;

                let url = new URL(`/api/cog/coord.png`, window.location.origin);
                url.searchParams.append('access', this.info.token)
                url = String(url).replace(/coord.png/, '{z}/{x}/{y}.png');

                this.map = new mapboxgl.Map({
                    container: 'map',
                    style: {
                        version: 8,
                        sources: {
                            'raster-tiles': {
                                type: 'raster',
                                tiles: [ url ],
                                tileSize: 256,
                            },
                        },
                        layers: [{
                            id: 'simple-tiles',
                            type: 'raster',
                            source: 'raster-tiles',
                            minzoom: 0,
                            maxzoom: 22
                        }]
                    },
                });

                this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

                this.map.on('load', () => {

                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
    }
}
</script>
