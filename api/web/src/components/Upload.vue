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
            <UploadFile
                :single='false'
                :url='base'
                :headers='headers'
                @err='$emit("err", $event)'
            />
        </div>
    </div>
</template>

<script>
import UploadFile from './util/Upload.vue';

export default {
    name: 'Upload',
    props: ['meta'],
    data: function() {
        return {
            base: new URL('/api/upload', window.location.origin),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            }
        }
    },
    methods: {
    },
    components: {
        UploadFile
    }
}
</script>
