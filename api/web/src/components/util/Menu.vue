<template>
<div class='absolute top border border--gray-light round px6 py6' style='left: calc(-48px + -24px); width: 62px;'>
    <button v-tooltip='"Uploads"' @click='$router.push("/")' class='btn round btn--stroke color-gray mb12'>
        <svg class='icon'><use href='#icon-picture'/></svg>
    </button>

    <button v-tooltip='"Collections"' @click='$router.push("/collection")' class='btn round btn--stroke color-gray mb12'>
        <svg class='icon'><use href='#icon-folder'/></svg>
    </button>

    <button v-tooltip='"Basemaps"' @click='$router.push("/basemap")' class='btn round btn--stroke color-gray mb12'>
        <svg class='icon'><use href='#icon-map'/></svg>
    </button>

    <button v-tooltip='"Sources"' @click='$router.push("/source")' class='btn round btn--stroke color-gray'>
        <svg class='icon'><use href='#icon-database'/></svg>
    </button>
</div>
</template>

<script>
export default {
    name: 'RasterMenu',
    data: function() {
        return {
            items: {
                Uploads: '/',
                Collections: '/collection',
                BaseMaps: '/basemap',
                Sources: '/source'

            }
        }
    }
}
</script>
