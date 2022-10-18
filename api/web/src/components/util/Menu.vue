<template>
<div class='absolute top' style='left: calc(-48px + -12px); width: 62px;'>
    <StdButton v-tooltip='"Uploads"' @click='$router.push("/")' class='mb6' icon='picture'/>
    <StdButton v-tooltip='"Collections"' @click='$router.push("/collection")' class='mb6' icon='folder'/>
    <StdButton v-tooltip='"Basemaps"' @click='$router.push("/basemap")' class='mb6' icon='map'/>
    <StdButton v-tooltip='"Sources"' @click='$router.push("/source")' class='mb6' icon='database'/>
</div>
</template>

<script>
export default {
    name: 'RasterMenu'
}
</script>
