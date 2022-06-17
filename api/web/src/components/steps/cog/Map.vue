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
        step: Object
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

                this.map = new mapboxgl.Map({
                    container: 'map',
                    zoom: 1,
                    style: 'mapbox://styles/mapbox/light-v9',
                });

                this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

                this.map.on('load', () => {
                    this.getMeta();
                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getMeta: async function() {
            try {
                this.meta = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}`);
            } catch (err) {
                this.$emit('err', err);
            t
        }
    }
}
</script>
