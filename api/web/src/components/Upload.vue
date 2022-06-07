<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                &gt;
                <span>New Upload</span>
            </h2>
        </div>
        <div class='round mb60 col col--12'>
            <UploadFile/>
        </div>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';
import UploadFile from './util/Upload.vue';

export default {
    name: 'Upload',
    props: ['meta'],
    data: function() {
        return {
        }
    },
    methods: {
    },
    components: {
        Loading,
        UploadFile
    }
}
</script>
