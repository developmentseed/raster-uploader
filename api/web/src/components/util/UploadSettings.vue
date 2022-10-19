<template>
<div class='col col--12 grid mb12'>
    <div class='col col--12'>
        <h2>COG Output</h2>
    </div>

    <div class='col col--4 px6'>
        <label>Block Size</label>
        <span class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
        <input :disabled='disabled' type='number' v-model='defaults.blocksize' class='input'/>
    </div>

    <div class='col col--4 px6'>
        <label>Compression</label>
        <span @click='external("")' class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
        <div class='select-container w-full'>
            <select :disabled='disabled' v-model='defaults.compression' class='select select--stroke'>
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

    <div class='col col--4 px6'>
        <label>Overview Level</label>
        <span class='fr ml3 cursor-pointer color-gray-light color-black-on-hover' style='margin-top: 5px;'><svg class='icon'><use xlink:href='#icon-info'/></svg></span>
        <input :disabled='disabled' type='number' v-model='defaults.overview' class='input'/>
    </div>
</div>
</template>

<script>
export default {
    name: 'UploadSettings',
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            defaults: {
                blocksize: 512,
                compression: 'deflate',
                overview: 5
            },
        }
    },
    mounted: function() {
        this.emit_settings();
    },
    watch: {
        'defaults.blocksize': function() {
            this.emit_settings();
        },
        'defaults.compression': function() {
            this.emit_settings();
        },
        'defaults.overview': function() {
            this.emit_settings();
        }
    },
    methods: {
        emit_settings: function() {
            this.$emit('settings', this.defaults);
        },
        external: function(url) {
            window.open(url, '_blank');
        }
    }
}

</script>
