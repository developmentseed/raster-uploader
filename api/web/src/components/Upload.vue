<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                &gt;
                <span>New Upload</span>
            </h2>
        </div>
        <div class='round mb60 col col--12 grid border border--gray-light py12 px12'>
            <UploadSettings/>

            <UploadFile
                :single='true'
                :url='base'
                :headers='headers'
                @err='$emit("err", $event)'
                @ok='$router.push(`/upload/${$event.id}/`)'
            />
        </div>
    </div>
</template>

<script>
import UploadFile from './util/Upload.vue';
import UploadSettings from './util/UploadSettings.vue';

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
        external: function(url) {
            window.open(url, '_blank');
        }
    },
    components: {
        UploadSettings,
        UploadFile
    }
}
</script>
