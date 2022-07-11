<template>
<div class='col col--12'>
    <div id='cy'></div>
</div>
</template>

<style>
#cy {
    height: 500px;
    width: 100%;
}
</style>

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
                nodes: [],
                edges: []
            }
        };
    },
    mounted: function() {
        // Populate Nodes
        this.processed.nodes.push({ data: { id: 'initial' } });
        for (const step of this.steps.upload_steps) {
            this.processed.nodes.push({ data: { id: String(step.id) } });
        }

        for (const step of this.steps.upload_steps) {
            if (!step.parent) {
                this.processed.edges.push({ data: {
                    source: 'initial',
                    target: String(step.id)
                }});
            } else {
                this.processed.edges.push({ data: {
                    source: String(step.parent),
                    target: String(step.id)
                }});
            }
        }

        this.$nextTick(() => {
            this.graph = Cytoscape({
                container: document.getElementById('cy'),
                elements: this.processed,
                boxSelectionEnabled: false,
                autounselectify: true,
                style: Cytoscape.stylesheet()
                    .selector('node').css({
                        'height': 80,
                        'width': 80,
                        'background-fit': 'cover',
                        'border-color': '#000',
                        'border-width': 3,
                        'border-opacity': 0.5
                    })
                    .selector('edge').css({
                        'curve-style': 'bezier',
                        'width': 6,
                        'target-arrow-shape': 'triangle',
                        'line-color': '#ffaaaa',
                        'target-arrow-color': '#ffaaaa'
                    }),
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
