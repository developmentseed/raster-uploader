<template>
<div @click='$router.push({ name: "upload", params: { uploadid: upload.id } })'>
    <div class='cursor-pointer bg-darken10-on-hover col col--12 py12'>
        <div class='col col--12 grid py6 px12'>
            <div class='col col--6'>
                <div class='col col--12 clearfix'>
                    <svg v-if='upload.starred' class='fl icon color-blue h24 w24 mr6'><use xlink:href='#icon-star'/></svg>
                    <h3 class='txt-h4 fl' v-text='upload.name'></h3>
                    <svg @click.stop='$router.push(`/collection/${upload.collection_id}`)' v-if='$route.name !== "collection" && upload.collection_id' class='fl icon color-gray color-black-on-hover h24 w24 mx6'><use xlink:href='#icon-clock'></use></svg>
                </div>
                <div class='col col--12'>
                    <h3 class='txt-xs' v-text='upload.source'></h3>
                </div>
            </div>
            <div class='col col--6'>
                <div v-if='upload.archived' class='fr bg-gray-faint bg-gray-on-hover color-white-on-hover color-gray inline-block px6 py3 round txt-xs txt-bold mr3'>
                    Archived
                </div>
                <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                    <span v-text='new Date(upload.created).toISOString()'/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'UploadItem',
    props: ['upload'],
}
</script>
