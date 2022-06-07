<template>
    <div class='col col--12 grid pt12'>
        <UploadFile/>
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
