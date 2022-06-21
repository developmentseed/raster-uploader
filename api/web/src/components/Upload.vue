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
            <div class='col col--12 grid grid--gut12 mb12'>
                <div class='col col--12'>
                    <h2>COG Output</h2>
                </div>

                <div class='col col--4'>
                    <label>Block Size</label>
                    <span class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
                    <input type='number' v-model='defaults.blocksize' class='input'/>
                </div>

                <div class='col col--4'>
                    <label>Compression</label>
                    <span @click='external("")' class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
                    <div class='select-container w-full'>
                        <select v-model='defaults.compression' class='select select--stroke'>
                            <option>deflate</option>
                            <option>jpeg</option>
                            <option>webp</option>
                            <option>zstd</option>
                            <option>lzw</option>
                            <option>lzma</option>
                            <option>packbits</option>
                            <option>lerc</option>
                            <option>lerc_deflate</option>
                            <option>raw</option>
                        </select>
                        <div class='select-arrow'></div>
                    </div>
                </div>

                <div class='col col--4'>
                    <label>Overview Level</label>
                    <span class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
                    <input type='number' v-model='defaults.overview' class='input'/>
                </div>
            </div>

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

export default {
    name: 'Upload',
    props: ['meta'],
    data: function() {
        return {
            base: new URL('/api/upload', window.location.origin),
            defaults: {
                blocksize: 512,
                compression: 'deflate',
                overview: 5
            },
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
        UploadFile
    }
}
</script>
