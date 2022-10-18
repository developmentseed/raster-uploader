<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default color-white'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/basemap")'>BaseMaps</span>
                &gt;
                <span v-if='$route.params.basemapid' v-text='basemap.id'/>
                <span v-else>New</span>
            </h2>

            <div class='fr'>
                <StdButton v-if='$route.params.basemapid' @click='deleteCollection' hover='red' icon='trash'/>
                <StdButton @click='$router.go(-1)' icon='close'/>
            </div>
        </div>
        <div class='round bg-white col col--12 px12 py12 clearfix relative'>
            <RasterMenu/>

            <template v-if='loading'>
                <Loading desc='Loading BaseMap'/>
            </template>
            <template v-else>
                <div class='grid grid--gut12'>
                    <div class='col col--12 py6'>
                        <label>BaseMap Name</label>
                        <input v-model='basemap.name' class='input' placeholder='BaseMap Name'/>
                    </div>

                    <div class='col col--12 py6'>
                        <label>BaseMap Url</label>
                        <input v-model='basemap.url' class='input' placeholder='BaseMap Name'/>

                        <InputError v-if='errors.url' desc='Invalid URL'/>
                        <InputError v-if='errors.wms' desc='WMS Endpoint must have {z}, {x}, {y} variables'/>
                    </div>

                    <div class='col col--12 py12'>
                        <template v-if='$route.params.basemapid'>
                            <button @click='postBaseMap' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update BaseMap</button>
                        </template>
                        <template v-else>
                            <button @click='postBaseMap' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add BaseMap</button>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </div>

</template>

<script>
import InputError from './util/InputError.vue';
import Loading from './util/Loading.vue';
import RasterMenu from './util/Menu.vue';

export default {
    name: 'BaseMap',
    mounted: function() {
        if (this.$route.params.basemapid) {
            this.getBaseMap();
        }
    },
    data: function() {
        return {
            loading: false,
            errors: {
                url: false,
            },
            basemap: {
                name: '',
                url: ''
            }
        };
    },
    methods: {
        getBaseMap: async function() {
            try {
                this.loading = true;
                this.basemap = await window.std(`/api/basemap/${this.$route.params.basemapid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        deleteBaseMap: async function() {
            this.loading = true;
            try {
                await window.std(window.api + `/api/basemap/${this.$route.params.basemapid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        postBaseMap: async function() {
            this.loading = true;
            try {
                new URL(this.basemap.url);
                this.errors.url = false;
            } catch (err) {
                this.errors.url = true;
                return;
            }

            if (!this.basemap.url.includes('{z}') || !this.basemap.url.includes('{x}') || !this.basemap.url.includes('{y}')) {
                this.errors.wms = true;
                return;
            } else {
                this.errors.wms = false;
            }

            try {
                await window.std(window.api + `/api/basemap${this.$route.params.basemapid ? '/' + this.$route.params.basemapid : ''}`, {
                    method: this.$route.params.basemapid ? 'PATCH' : 'POST',
                    body: {
                        name: this.basemap.name,
                        url: this.basemap.url
                    }
                });

                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        }
    },
    components: {
        Loading,
        InputError,
        RasterMenu
    }
}
</script>
