<template>
<div class='col col--12 grid pt12'>
    <template v-if='loading.upload'>
        <Loading desc='Loading Upload'/>
    </template>
    <template v-else-if='loading.delete'>
        <Loading desc='Deleting Upload'/>
    </template>
    <template v-else>
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                &gt;
                <span v-text='upload.id'></span>
            </h2>

            <div class='fr'>
                <button
                    @click='mode = "processing"'
                    class='btn round btn--s btn--pill btn--pill-hl btn--gray'
                    :class='{ "btn--stroke": mode !== "processing" }'
                >
                    Processing
                </button>
                <button
                    @click='mode = "metadata"'
                    class='btn round btn--s btn--pill btn--pill-hr btn--gray'
                    :class='{ "btn--stroke": mode !== "metadata" }'
                >
                    Metadata
                </button>

                <button @click='upload.starred = !upload.starred' class='mx6 btn btn--stroke round' :class='{
                    "color-blue": upload.starred,
                    "color-gray-light": !upload.starred,
                    "color-gray-on-hover": !upload.starred
                }'>
                    <svg class='icon'><use href='#icon-star'/></svg>
                </button>

                <button @click='deleteUpload' class='btn round btn--stroke color-gray color-red-on-hover'>
                    <svg class='icon'><use href='#icon-trash'/></svg>
                </button>
            </div>
        </div>

        <template v-if='steps.upload_steps.length > 0'>
            <div class='border border--gray-light round mb12 col col--12'>
                <UploadedGraph
                    :steps='steps'
                    @steps='linear = $event'
                />
            </div>
        </template>

        <div class='border border--gray-light round mb60 col col--12'>
            <StepInitial
                :upload=upload
                :open='!linear.length'
                @err='$emit("err", $event)'
            />

            <template v-if='loading.steps'>
                <Loading desc='Loading Upload Steps'/>
            </template>
            <template v-else>
                <div :key='step.id' v-for='(step, step_it) in linear' class='col col--12'>
                    <template v-if='step.type === "error"'>
                        <StepError
                            :key='step.id'
                            :step='step'
                            :open='!polling.steps && step_it === linear.length-1'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else-if='step.type === "text"'>
                        <StepText
                            :key='step.id'
                            :step='step'
                            :open='!polling.steps && step_it === linear.length-1'
                            @step='getUploadSteps'
                            @split='postStep($event)'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else-if='step.type === "selection"'>
                        <StepSelection
                            :key='step.id'
                            :step='step'
                            :open='!polling.steps && step_it === linear.length-1'
                            @step='getUploadSteps'
                            @split='postStep($event)'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else-if='step.type === "cog"'>
                        <StepCog
                            :key='step.id'
                            :step='step'
                            :open='!polling.steps && step_it === linear.length-1'
                            @step='getUploadSteps'
                            @split='postStep($event)'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else>
                        Unknown Step
                    </template>
                </div>
            </template>

            <template v-if='polling.steps'>
                <StepLoading/>
            </template>
            <template v-else-if='upload.obtain && !upload.uploaded'>
                <Loading desc='Waiting for Obtain Script to Complete'/>
            </template>
        </div>
    </template>
</div>
</template>

<script>
import Loading from './util/Loading.vue';
import UploadedGraph from './uploaded/Graph.vue';
import StepSelection from './steps/Selection.vue';
import StepText from './steps/Text.vue';
import StepLoading from './steps/Loading.vue';
import StepCog from './steps/Cog.vue';
import StepError from './steps/Error.vue';
import StepInitial from './steps/Initial.vue';

export default {
    name: 'Uploaded',
    props: ['meta'],
    data: function() {
        return {
            mode: 'processing',
            loading: {
                upload: true,
                delete: false,
                steps: true
            },
            polling: {
                steps: false,
                upload: false
            },
            steps: {
                total: 0,
                upload_steps: []
            },
            linear: [],
            upload: {
                id: false,
                starred: false
            }
        }
    },
    mounted: async function() {
        await this.getUpload();
        if (this.upload.uploaded) await this.getUploadSteps();

        this.calcPoll();
    },
    unmounted: async function() {
        if (this.polling.steps) clearInterval(this.polling.steps);
        if (this.polling.upload) clearInterval(this.polling.upload);
    },
    watch: {
        'upload.starred': function() {
            this.patchUpload();
        },
        linear: {
            deep: true,
            handler: function() {
                this.calcPoll();
            }
        }
    },
    methods: {
        calcPoll: function() {
            const poll = this.linear.length ? this.linear[this.linear.length - 1].closed : true;

            if (poll && !this.polling.steps) {
                this.polling.steps = setInterval(() => {
                    this.getUploadSteps(false);
                }, 5000);
            } else if (!poll && this.polling.steps) {
                clearInterval(this.polling.steps);
                this.polling.steps = false;
            }
        },
        postStep: async function(step) {
            try {
                await window.std(`/api/upload/${this.$route.params.uploadid}/step`, {
                    method: 'POST',
                    body: {
                        type: step.type,
                        config: step.config,
                        parent: step.parent,
                        closed: false,
                        step: step.step
                    }
                });

                this.getUploadSteps();
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getUpload: async function() {
            try {
                this.loading.upload = true;
                this.upload = await window.std(`/api/upload/${this.$route.params.uploadid}`);
                this.loading.upload = false;

                const poll = !this.upload.uploaded && this.upload.obtain;

                if (poll && !this.polling.upload) {
                    this.polling.upload = setInterval(() => {
                        this.getUpload(false);
                    }, 5000);
                } else if (!poll && this.polling.upload) {
                    clearInterval(this.polling.upload);
                    if (!this.polling.steps) this.getUploadSteps();
                }
            } catch (err) {
                this.$emit('err', err);
            }
        },
        patchUpload: async function() {
            try {
                this.upload = await window.std(`/api/upload/${this.$route.params.uploadid}`, {
                    method: 'PATCH',
                    body: {
                        starred: this.upload.starred
                    }
                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getUploadSteps: async function(loading=true) {
            try {
                if (loading) this.loading.steps = true;
                this.steps = await window.std(`/api/upload/${this.$route.params.uploadid}/step`);
                if (loading) this.loading.steps = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteUpload: async function() {
            if (this.polling.steps) clearInterval(this.polling.steps);
            if (this.polling.upload) clearInterval(this.polling.upload);

            try {
                this.loading.delete = true;
                await window.std(`/api/upload/${this.$route.params.uploadid}`, {
                    method: 'DELETE'
                });
                this.loading.delete = false;

                this.$router.push('/');
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        UploadedGraph,
        StepSelection,
        StepText,
        StepLoading,
        StepInitial,
        StepError,
        StepCog
    }
}
</script>
