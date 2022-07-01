<template>
    <div class='col col--12 grid pt12'>
        <template v-if='loading.upload'>
            <Loading desc='Loading Upload'/>
        </template>
        <template v-else>
            <div class='col col--12 clearfix py6'>
                <h2 class='fl cursor-default'>
                    <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                    &gt;
                    <span v-text='upload.id'></span>
                </h2>

                <div class='fr'>
                    <button @click='deleteUpload' class='btn round btn--stroke color-gray color-red-on-hover'>
                        <svg class='icon'><use href='#icon-trash'/></svg>
                    </button>
                </div>
            </div>
            <div class='border border--gray-light round mb60 col col--12'>
                <StepInitial
                    :upload=upload
                    @err='$emit("err", $event)'
                />

                <div :key='step.id' v-for='step in steps.upload_steps' class='col col--12'>
                    <template v-if='loading.steps'>
                        <Loading desc='Loading Upload Steps'/>
                    </template>
                    <template v-else-if='step.type === "error"'>
                        <StepError
                            :step='step'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else-if='step.type === "selection"'>
                        <StepSelection
                            :step='step'
                            @step='getUploadSteps'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else-if='step.type === "cog"'>
                        <StepCog
                            :step='step'
                            @step='getUploadSteps'
                            @err='$emit("err", $event)'
                        />
                    </template>
                    <template v-else>
                        Unknown Step
                    </template>
                </div>

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
import StepSelection from './steps/Selection.vue';
import StepLoading from './steps/Loading.vue';
import StepCog from './steps/Cog.vue';
import StepError from './steps/Error.vue';
import StepInitial from './steps/Initial.vue';

export default {
    name: 'Uploaded',
    props: ['meta'],
    data: function() {
        return {
            loading: {
                upload: true,
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
            upload: {
                id: false
            }
        }
    },
    mounted: async function() {
        await this.getUpload();
        if (this.upload.uploaded) await this.getUploadSteps();
    },
    unmounted: async function() {
        if (this.polling.steps) clearInterval(this.polling.steps);
        if (this.polling.upload) clearInterval(this.polling.upload);
    },
    methods: {
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
        getUploadSteps: async function(loading=true) {
            try {
                if (loading) this.loading.steps = true;
                this.steps = await window.std(`/api/upload/${this.$route.params.uploadid}/step`);
                if (loading) this.loading.steps = false;

                const poll = !this.steps.upload_steps.some((step) => {
                    return !step.closed;
                });

                if (poll && !this.polling.steps) {
                    this.polling.steps = setInterval(() => {
                        this.getUploadSteps(false);
                    }, 5000);
                } else if (!poll && this.polling.steps) {
                    clearInterval(this.polling.steps);
                }
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteUpload: async function() {
            try {
                this.loading.upload = true;
                await window.std(`/api/upload/${this.$route.params.uploadid}`, {
                    method: 'DELETE'
                });
                this.loading.upload = false;

                this.$router.push('/');
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        StepSelection,
        StepLoading,
        StepInitial,
        StepError,
        StepCog
    }
}
</script>
