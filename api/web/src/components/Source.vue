<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/source")'>Sources</span>
                &gt;
                <span v-if='$route.params.sourceid' v-text='source.id'/>
                <span v-else>New</span>
            </h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='$route.params.sourceid' @click='deleteSource' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--12 py6'>
                    <label>Source Name</label>
                    <input v-model='source.name' class='input' placeholder='Source Name'/>
                </div>

                <div class='col col--12 py6'>
                    <label>Source Url</label>
                    <input v-model='source.url' class='input' placeholder='Source Url'/>

                    <InputError v-if='errors.url' desc='Invalid URL'/>
                    <InputError v-if='errors.wms' desc='WMS Endpoint must have {z}, {x}, {y} variables'/>
                </div>

                <div class='col col--12 py12'>
                    <template v-if='$route.params.sourceid'>
                        <button @click='postSource' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Source</button>
                    </template>
                    <template v-else>
                        <button @click='postSource' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Source</button>
                    </template>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import InputError from './util/InputError.vue';

export default {
    name: 'Source',
    mounted: function() {
        if (this.$route.params.sourceid) {
            this.getSource();
        }
    },
    data: function() {
        return {
            errors: {
                url: false,
            },
            source: {
                name: '',
                url: ''
            }
        };
    },
    methods: {
        getSource: async function() {
            try {
                this.source = await window.std(`/api/source/${this.$route.params.sourceid}`);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteSource: async function() {
            try {
                await window.std(window.api + `/api/source/${this.$route.params.sourceid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        postSource: async function() {
            try {
                new URL(this.source.url);
                this.errors.url = false;
            } catch (err) {
                this.errors.url = true;
                return;
            }

            if (!this.source.url.includes('{z}') || !this.source.url.includes('{x}') || !this.source.url.includes('{y}')) {
                this.errors.wms = true;
                return;
            } else {
                this.errors.wms = false;
            }

            try {
                await window.std(window.api + `/api/source${this.$route.params.sourceid ? '/' + this.$route.params.sourceid : ''}`, {
                    method: this.$route.params.sourceid ? 'PATCH' : 'POST',
                    body: {
                        name: this.source.name,
                        url: this.source.url
                    }
                });

                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        InputError
    }
}
</script>
