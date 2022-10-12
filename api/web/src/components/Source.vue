<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/source")'>Sources</span>
                &gt;
                <span v-if='$route.params.sourceid' v-text='source.id'/>
                <span v-else>New</span>
            </h2>

            <button v-if='!modal' @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='$route.params.sourceid' @click='deleteSource' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix relative'>
            <RasterMenu/>

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

                    <div class='col col--12 py6'>
                        <label>Source Glob</label>

                        <div class='fr'>
                            <label class='switch-container'>
                                <input v-model='hasGlob' type='checkbox' />
                                <div class='switch'></div>
                            </label>
                        </div>

                        <input :disabled='!hasGlob' v-model='source.glob' class='input' placeholder='Source Glob'/>
                    </div>
                </div>
                <template v-if='!showsecrets && $route.params.sourceid'>
                    <div class='border border--gray-light round col col--12 px12 py12 grid clearfix'>
                        <div class='col col--12 flex flex--center-main'>
                            Stored secrets cannot be retrieved
                        </div>
                        <div class='col col--12 flex flex--center-main'>
                            To modify, resubmit all secrets
                        </div>

                        <div class='col col--12 flex flex--center-main mt12 mb6'>
                            <button @click='showsecrets = true' class='btn btn--stroke round fr color-gray color-red-on-hover'>Reset Secrets</button>
                        </div>
                    </div>
                </template>
                <template v-else>

                    <div class='col col--12 flex flex--center-main mb3 mt12'>
                        <div class='toggle-group mr18'>
                            <label class='toggle-container'>
                                <input v-model='source.type' id='http' value='http' name='upload-type' type='radio' />
                                <div class='toggle toggle--s round'>HTTP</div>
                            </label>
                            <label class='toggle-container'>
                                <input v-model='source.type' id='s3' value='s3' name='upload-type' type='radio' />
                                <div class='toggle toggle--s round'>AWS S3</div>
                            </label>
                        </div>
                    </div>

                   <template v-if='source.type === "http"'>
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
                    <template v-else-if='source.type === "s3"'>
                        <div class='col col--12 py6'>
                            <label>AWS Access Key ID</label>
                            <input type='text' v-model='secrets.access_key_id' class='input w-full'/>
                        </div>
                        <div class='col col--12 py6'>
                            <label>AWS Secret Access Key</label>
                            <input type='text' v-model='secrets.secret_access_key' class='input w-full'/>
                        </div>
                    </template>
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
import RasterMenu from './util/Menu.vue';

export default {
    name: 'UploadSource',
    props: {
        modal: {
            type: Boolean,
            default: false
        }
    },
    mounted: async function() {
        if (this.$route.params.sourceid) {
            await this.getSource();
            if (this.source.glob !== null) this.hasGlob = true;
        }
    },
    data: function() {
        return {
            errors: {
                url: false,
            },
            hasGlob: false,
            loading: false,
            showsecrets: false,
            secrets: {
                secret_access_key: '',
                access_key_id: '',
                headers: [{
                    key: '',
                    value: ''
                }]
            },
            source: {
                type: 'http',
                name: '',
                url: '',
                glob: ''
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

                if (!this.modal) {
                    this.$emit('refresh');
                    this.$router.go(-1);
                } else {
                    this.$emit('close');
                }
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

            const body = {
                name: this.source.name,
                type: this.source.type,
                url: this.source.url,
                glob: this.hasGlob ? this.source.glob : null
            }

            if (this.source.type === 'http') {
                body.secrets = {
                    headers: this.secrets.headers
                }
            } else if (this.source.type === 's3') {
                body.secrets = {
                    secret_access_key: this.secrets.secret_access_key,
                    access_key_id: this.secrets.access_key_id
                }
            }

            this.loading = true;

            try {
                await window.std(window.api + `/api/source${this.$route.params.sourceid ? '/' + this.$route.params.sourceid : ''}`, {
                    method: this.$route.params.sourceid ? 'PATCH' : 'POST',
                    body: body
                });

                if (!this.modal) {
                    this.$emit('refresh');
                    this.$router.go(-1);
                } else {
                    this.$emit('close');
                }
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        }
    },
    components: {
        InputError,
        RasterMenu,
        Loading
    }
}
</script>
