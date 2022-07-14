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
            <template v-if='loading'>
                <Loading desc='Loading Source'/>
            </template>
            <template v-else>
                <div class='grid grid--gut12'>
                    <div class='col col--12 py6'>
                        <label>Source Name</label>
                        <input v-model='source.name' class='input' placeholder='Source Name'/>
                    </div>

                    <div class='col col--12 py6'>
                        <label>Source Url</label>
                        <input v-model='source.url' class='input' placeholder='Source Url'/>

                        <InputError v-if='errors.url' desc='Invalid URL'/>
                    </div>
                </div>

                <div class='col col--12 flex flex--center-main mb3 mt12'>
                    <div class='toggle-group mr18'>
                        <label class='toggle-container'>
                            <input v-model='uploadtype' id='http' value='http' name='upload-type' type='radio' />
                            <div class='toggle toggle--s round'>HTTP</div>
                        </label>
                        <label class='toggle-container'>
                            <input v-model='uploadtype' id='s3' value='s3' name='upload-type' type='radio' />
                            <div class='toggle toggle--s round'>AWS S3</div>
                        </label>
                    </div>
                </div>

                <template v-if='uploadtype === "http"'>
                    <div class='col col--12 grid'>
                        <label class='w-full'>Headers</label>

                        <div class='border border--gray-light round col col--12 px12 py12 grid clearfix'>
                            <div v-if='secrets.headers.length' class='col col--6'>Key</div>
                            <div v-if='secrets.headers.length' class='col col--6'>Value</div>
                            <div :key='header.key' v-for='(header, h_it) in secrets.headers' class='col col--12 grid grid--gut12 mt6'>
                                <div class='col col--5'>
                                    <input type='text' v-model='header.key' class='input w-full'/>
                                </div>
                                <div class='col col--6'>
                                    <input type='text' v-model='header.value' class='input w-full'/>
                                </div>
                                <div class='col col--1'>
                                    <button @click='secrets.headers.splice(h_it, 1)' class='btn btn--stroke round color-gray color-red-on-hover h36'>
                                        <svg class='icon'><use href='#icon-trash'/></svg>
                                    </button>
                                </div>
                            </div>

                            <div class='col col--12 flex flex--center-main mb3 mt12'>
                                <button @click='secrets.headers.push({ key: "", value: "" })' class='btn btn--stroke round color-gray-light color-green-on-hover'>Add Header</button>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else-if='uploadtype === "s3"'>
                    <div class='col col--12 py6'>
                        <label>AWS Access Key ID</label>
                        <input type='text' v-model='secrets.access_key_id' class='input w-full'/>
                    </div>
                    <div class='col col--12 py6'>
                        <label>AWS Secret Access Key</label>
                        <input type='text' v-model='secrets.secret_access_key' class='input w-full'/>
                    </div>
                </template>

                <div class='col col--12 py12'>
                    <template v-if='$route.params.sourceid'>
                        <button @click='postSource' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Source</button>
                    </template>
                    <template v-else>
                        <button @click='postSource' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Source</button>
                    </template>
                </div>
            </template>
        </div>
    </div>

</template>

<script>
import InputError from './util/InputError.vue';
import Loading from './util/Loading.vue';

export default {
    name: 'UploadSource',
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
            loading: false,
            uploadtype: 'http',
            secrets: {
                secret_access_key: '',
                access_key_id: '',
                headers: [{
                    key: '',
                    value: ''
                }]
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
                this.loading = true;
                this.source = await window.std(`/api/source/${this.$route.params.sourceid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        deleteSource: async function() {
            try {
                this.loading = true;
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

            const secrets = {};
            if (this.uploadtype === 'http') {
                secrets.headers = this.secrets.headers;
            } else if (this.uploadtype === 's3') {
                secrets.secret_access_key = this.secrets.secret_access_key;
                secrets.access_key_id = this.secrets.access_key_id;
            }

            this.loading = true;
            try {
                await window.std(window.api + `/api/source${this.$route.params.sourceid ? '/' + this.$route.params.sourceid : ''}`, {
                    method: this.$route.params.sourceid ? 'PATCH' : 'POST',
                    body: {
                        name: this.source.name,
                        url: this.source.url,
                        type: this.uploadtype,
                        secrets
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
        InputError,
        Loading
    }
}
</script>
