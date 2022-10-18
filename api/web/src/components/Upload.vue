<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 clearfix py6 color-white'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/")'>Uploads</span>
                &gt;
                <span>New Upload</span>
            </h2>

            <div class='fr'>
                <StdButton @click='$router.go(-1)' icon='close'/>
            </div>
        </div>
        <div class='bg-white round col col--12 grid py12 px12 relative'>
            <RasterMenu/>

            <UploadSettings
                @settings='settings = $event'
            />

            <div class='col col--12 flex flex--center-main mb3'>
                <div class='toggle-group mr18'>
                    <label class='toggle-container'>
                        <input v-model='uploadtype' id='upload' value='upload' checked name='upload-type' type='radio' />
                        <div class='toggle toggle--s round'>Upload</div>
                    </label>
                    <label class='toggle-container'>
                        <input v-model='uploadtype' id='http' value='http' name='upload-type' type='radio' />
                        <div class='toggle toggle--s round'>HTTP</div>
                    </label>
                    <label class='toggle-container'>
                        <input v-model='uploadtype' id='s3' value='s3' name='upload-type' type='radio' />
                        <div class='toggle toggle--s round'>AWS S3</div>
                    </label>
                </div>
            </div>

            <template v-if='uploadtype === "upload"'>
                <UploadFile
                    :single='true'
                    :url='base'
                    :headers='headers'
                    :fields='settings'
                    @err='$emit("err", $event)'
                    @ok='$router.push(`/upload/${$event.id}/`)'
                />
            </template>
            <template v-else-if='uploadtype === "http"'>
                <UploadHTTP
                    :cog='settings'
                    @err='$emit("err", $event)'
                    @ok='$router.push(`/upload/${$event.id}/`)'
                />
            </template>
            <template v-else-if='uploadtype === "s3"'>
                <UploadS3
                    :cog='settings'
                    @err='$emit("err", $event)'
                    @ok='$router.push(`/upload/${$event.id}/`)'
                />
            </template>
        </div>
    </div>
</template>

<script>
import RasterMenu from './util/Menu.vue';
import UploadS3 from './util/UploadS3.vue';
import UploadHTTP from './util/UploadHTTP.vue';
import UploadFile from './util/Upload.vue';
import UploadSettings from './util/UploadSettings.vue';

export default {
    name: 'Upload',
    props: ['meta'],
    data: function() {
        return {
            settings: {},
            uploadtype: 'upload',
            base: new URL('/api/upload', window.location.origin),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            }
        }
    },
    components: {
        RasterMenu,
        UploadSettings,
        UploadFile,
        UploadHTTP,
        UploadS3
    }
}
</script>
