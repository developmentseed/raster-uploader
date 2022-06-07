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

                <div class='fr'>
                    <button @click='deleteUpload' class='btn round btn--stroke color-gray color-red-on-hover'>
                        <svg class='icon'><use href='#icon-trash'/></svg>
                    </button>
                </div>
            </div>
            <div class='border border--gray-light round mb60 col col--12'>
                IMAGE UPLOAD
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
                this.upload = await window.std(`/api/upload/${this.$route.params.uploadid}`);
                this.loading.upload = false;
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
        Loading
    }
}
</script>
