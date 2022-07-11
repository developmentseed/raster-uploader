<template>
<div class='col col--12'>
    <div id='cy'></div>
</div>
</template>

<script>
import Cytoscape from 'cytoscape';

export default {
    name: 'UploadedGraph',
    props: {
        steps: Object
    },
    data: function() {
        return {
            graph: {},
            processed: {
                elements: {
                    nodes: [
                        { data: { id: 'cat' } },
                        { data: { id: 'bird' } },
                        { data: { id: 'ladybug' } },
                        { data: { id: 'aphid' } },
                        { data: { id: 'rose' } },
                        { data: { id: 'grasshopper' } },
                        { data: { id: 'plant' } },
                        { data: { id: 'wheat' } }
                    ],
                    edges: [
                        { data: { source: 'cat', target: 'bird' } },
                        { data: { source: 'bird', target: 'ladybug' } },
                        { data: { source: 'bird', target: 'grasshopper' } },
                        { data: { source: 'grasshopper', target: 'plant' } },
                        { data: { source: 'grasshopper', target: 'wheat' } },
                        { data: { source: 'ladybug', target: 'aphid' } },
                        { data: { source: 'aphid', target: 'rose' } }
                    ]
                },
            }
        };
    },
    mounted: function() {
        this.$nextTick(() => {
            this.graph = cytoscape({
                container: document.getElementById('cy'),
                elements: this.processed,
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10
                }
            });
        });
    }
}
</script>
