<template>
    <div class='col col--12 grid pt12'>
        <template v-if='loading.upload'>
            <Loading/>
        </template>
        <template v-else>
            <div class='col col--12 clearfix py6'>
                <h2 class='fl cursor-default'>
                    <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                    &gt;
                    <span v-text='upload.id'></span>
                </h2>
            </div>
            <div class='round mb60 col col--12'>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Uploaded',
    props: ['meta'],
    data: function() {
        return {
            loading: {
                upload: true
            },
            upload: {
                id: false
            }
        }
    },
    mounted: async function() {
        await this.getUpload();
    },
    methods: {
        getUpload: async function() {
            try {
                this.loading.upload = true;
                this.upload = await window.std(`/api/upload/${this.$route.uploadid}`);
                this.loading.upload = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading
    }
}
</script>
