<template>
<h2 @click='$router.push({ path: "/" })' class='dropdown fl cursor-default'>
    <svg class='icon inline'><use href='#icon-chevron-down'/></svg>

    <span v-text='item'/>

    <div class='round dropdown-content color-black' style='top: 24px;'>
        <div :key='i' v-for='i in Object.keys(items).filter((i) => { return i !== item; })' @click.stop='$router.push({ path: items[i] })' class='round bg-gray-light-on-hover cursor-pointer px12' v-text='i'></div>
    </div>
</h2>
</template>

<script>
export default {
    name: 'RasterMenu',
    props: {
        item: String
    },
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
