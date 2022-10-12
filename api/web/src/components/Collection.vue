<template>
<div class="col col--12">
    <div class='col col--12 clearfix py6'>
        <h2 class='fl cursor-default'>
            <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/collection")'>Collections</span>
            &gt;
            <span v-if='$route.params.collectionid' v-text='collection.id'/>
            <span v-else>New</span>
        </h2>

        <div class='fr'>
            <button v-if='$route.params.collectionid' @click='deleteCollection' class='mr12 btn round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>

            <button @click='$router.go(-1)' class='btn round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <div class='mr12 fl'>
                <span class='mx3'>Paused</span>
                <label class='switch-container'>
                    <input v-model='collection.paused' type='checkbox' />
                    <div class='switch'></div>
                </label>
            </div>
        </div>
    </div>
    <div class='border border--gray-light round col col--12 px12 py12 clearfix relative'>
        <RasterMenu/>

        <template v-if='loading.collection'>
            <Loading desc='Loading Collection'/>
        </template>
        <template v-else>
            <div class='grid grid--gut12'>
                <div class='col col--12 py6'>
                    <label>Collection Name</label>
                    <input v-model='collection.name' class='input' placeholder='Collection Name'/>
                </div>

                <div class='col col--12 py6'>
                    <label>Collection Cron</label>
                    <input v-model='collection.cron' class='input' placeholder='Collection Cron'/>

                    <template v-if='errors.cron'>
                        <InputError :desc='human'/>
                    </template>
                    <template v-else>
                        <span v-text='human'/>
                    </template>
                </div>

                <template v-if='$route.params.collectionid'>
                    <label class='ml12'>Upload Source:</label>
                    <div @click='$router.push(`/source/${source.id}`)' class='flex flex--center-main col col--12 border border--gray-light border--gray-on-hover cursor-pointer ml12 round py6'>
                        <div v-text='source.name'></div>
                    </div>
                </template>
                <template v-else>
                    <Selection
                        key='upload_sources'
                        :create='true'
                        filter_param='filter'
                        @create='modal.source=true'
                        :url='source_url'
                        @selection='collection.source_id = $event'
                    />
                </template>

                <template v-if='$route.params.collectionid'>
                    <label class='ml12'>Upload Config:</label>

                    <div class='ml12 pre col col--12' v-text='collection.config'></div>
                </template>
                <template v-else>
                    <Selection
                        key='uploads'
                        :create='false'
                        filter_param='filter'
                        :url='upload_url'
                        @selection='upload_id = $event'
                    />
                </template>

                <div v-if='upload_id && steps.total' class='border border--gray-light round mb12 ml12 col col--12'>
                    <UploadedGraph
                        :steps='steps'
                        @steps='linear = $event'
                    />
                </div>

                <div class='col col--12 py12'>
                    <template v-if='$route.params.collectionid'>
                        <button @click='postCollection' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Collection</button>
                    </template>
                    <template v-else>
                        <button @click='postCollection' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Collection</button>
                    </template>
                </div>
            </div>

            <template v-if='$route.params.collectionid'>
                <div class='col col--12 clearfix'>
                    <h2 class='mb3 fl'>Uploads</h2>

                    <button @click='postTrigger' class='fr btn round btn--stroke color-gray color-green-on-hover'>
                        <svg class='icon'><use href='#icon-plus'/></svg>
                    </button>
                </div>

                <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
                    <template v-if='loading.collection_uploads'>
                        <Loading desc='Loading Uploads'/>
                    </template>
                    <template v-if='loading.trigger'>
                        <Loading desc='Triggering Collection Run'/>
                    </template>
                    <template v-else-if='collection_uploads.total === 0'>
                        <None name='Uploads'/>
                    </template>
                    <template v-else>
                        <div :key='upload.id' v-for='upload in collection_uploads.uploads' class='col col--12'>
                            <UploadItem :upload='upload'/>
                        </div>
                    </template>
                </div>
            </template>
        </template>
    </div>

    <Modal v-if='modal.source' @close='modal.source = false'>
        <UploadSource @err='emit("err", $event)' :modal='true' @close='modal.source = false'/>
    </Modal>
</div>
</template>

<script>
import Loading from './util/Loading.vue';
import RasterMenu from './util/Menu.vue';
import UploadItem from './util/UploadItem.vue';
import InputError from './util/InputError.vue';
import Selection from './util/Selection.vue';
import None from './util/None.vue';
import Modal from './util/Modal.vue';
import UploadSource from './Source.vue';
import UploadedGraph from './uploaded/Graph.vue';
import cron from 'cronstrue';

export default {
    name: 'Collection',
    mounted: async function() {
        if (this.$route.params.collectionid) {
            await this.getCollection();
            this.getSource(this.collection.source_id);
            this.setHuman();

            this.getCollectionUploads();
        } else {
            this.setHuman();
        }
    },
    data: function() {
        return {
            source_url: new URL("/api/source", window.api),
            upload_url: new URL("/api/upload", window.api),
            loading: {
                collection: false,
                collection_uploads: true,
                trigger: false
            },
            human: '',
            errors: {
                cron: false
            },
            modal: {
                source: false
            },
            collection_uploads: {
                total: 0,
                uploads: []
            },
            steps: {
                total: 0,
                upload_steps: []
            },
            source: {},
            upload_id: false,
            collection: {
                name: '',
                cron: '1 12 ? * MON-FRI *',
                source_id: null,
                paused: false,
                config: {}
            }
        };
    },
    watch: {
        'collection.cron': function() {
            this.setHuman()
        },
        upload_id: function() {
            this.getUploadSteps();
        }
    },
    methods: {
        postTrigger: async function() {
            try {
                this.loading.trigger = true;
                 await window.std(`/api/collection/${this.$route.params.collectionid}/trigger`, {
                    method: 'POST'
                });
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.trigger = false;
        },
        setHuman: function() {
            try {
                this.errors.cron = false;
                this.human = cron.toString(this.collection.cron)
            } catch (err) {
                this.errors.cron = true;
                this.human = String(err);
            }
        },
        getSource: async function(source_id) {
            if (!source_id) return;
            try {
                this.source = await window.std(`/api/source/${source_id}`);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getUploadSteps: async function() {
            try {
                this.steps = await window.std(`/api/upload/${this.upload_id}/step`);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getCollectionUploads: async function() {
            try {
                this.loading.collection_uploads = true;
                this.collection_uploads = await window.std(`/api/upload?collection=${this.$route.params.collectionid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.collection_uploads = false;
        },
        getCollection: async function() {
            try {
                this.loading.collection = true;
                this.collection = await window.std(`/api/collection/${this.$route.params.collectionid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.collection = false;
        },
        deleteCollection: async function() {
            this.loading.collection = true;
            try {
                await window.std(window.api + `/api/collection/${this.$route.params.collectionid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.collection = false;
        },
        postCollection: async function() {
            this.loading.collection = true;

            const body = {
                name: this.collection.name,
                cron: this.collection.cron,
                paused: this.collection.paused
            };

            if (!this.$route.params.collectionid) {
                body.source_id = this.collection.source_id;
                body.config = this.collection.config;
            }

            try {
                this.collection = await window.std(window.api + `/api/collection${this.$route.params.collectionid ? '/' + this.$route.params.collectionid : ''}`, {
                    method: this.$route.params.collectionid ? 'PATCH' : 'POST',
                    body
                });

                if (!this.$route.params.collectionid) {
                    this.$emit('refresh');
                    this.$router.go(-1);
                }
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.collection = false;
        }
    },
    components: {
        None,
        UploadSource,
        UploadedGraph,
        Modal,
        Loading,
        UploadItem,
        InputError,
        Selection,
        RasterMenu
    }
}
</script>
