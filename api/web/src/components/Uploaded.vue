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
                IMAGE UPLOAD

                <div :key='step.id' v-for='step in steps.upload_steps' class='col col--12'>
                    <template v-if='loading.steps'>
                        <Loading desc='Loading Upload Steps'/>
                    </template>
                    <template v-else-if='step.type === "selection"'>
                        <StepSelection
                            :step='step'
                            @step='step = $event'
                        />
                    </template>
                    <template v-else-if='step.type === "cog"'>
                        <StepCog
                            :step='step'
                            @step='step = $event'
                        />
                    </template>
                    <template v-else>
                        Unknown Step
                    </template>
                </div>

                <div v-if='poll' class='col col--12'>
                    <Loading desc='Polling for next steps'/>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';
import StepSelection from './steps/Selection.vue';
import StepCog from './steps/Cog.vue';

export default {
    name: 'Uploaded',
    props: ['meta'],
    data: function() {
        return {
            loading: {
                upload: true,
                steps: true
            },
            poll: true,
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
        await this.getUploadSteps();
    },
    methods: {
        getUpload: async function() {
            try {
                this.loading.upload = true;
                this.upload = await window.std(`/api/upload/${this.$route.params.uploadid}`);
                this.loading.upload = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getUploadSteps: async function() {
            try {
                this.loading.steps = true;
                this.steps = await window.std(`/api/upload/${this.$route.params.uploadid}/step`);
                this.loading.steps = false;

                this.poll = this.steps.upload_steps.some((step) => {
                    return step.closed;
                });
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
        StepCog
    }
}
</script>
