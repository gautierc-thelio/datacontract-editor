import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '../../store.js';
import { parseYaml } from '../../utils/yaml.js';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 50;

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (which is center) to top left
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const LineageView = () => {
  const contracts = useEditorStore((state) => state.contracts) || {};

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    if (!contracts || Object.keys(contracts).length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    Object.entries(contracts).forEach(([path, data]) => {
      try {
        const parsed = parseYaml(data.currentYaml);
        const nodeId = path;
        nodes.push({
          id: nodeId,
          data: { label: parsed.name || path },
          style: {
            background: '#fff',
            color: '#4f46e5',
            border: '1px solid #4f46e5',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 'bold',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: nodeWidth,
            height: nodeHeight
          },
        });

        // Look for upstream dependencies in transform (source objects)
        if (parsed.transform) {
          parsed.transform.forEach((t) => {
            if (t.sources) {
              t.sources.forEach((source) => {
                const sourceId = source.object || source.name;
                if (sourceId) {
                  edges.push({
                    id: `e-${sourceId}-${nodeId}`,
                    source: sourceId,
                    target: nodeId,
                    animated: true,
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      color: '#4f46e5',
                    },
                    style: { stroke: '#4f46e5' },
                  });
                }
              });
            }
          });
        }
      } catch (e) {
        nodes.push({
          id: path,
          data: { label: `${path} (Error)` },
          style: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #b91c1c' },
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );

    return { initialNodes: layoutedNodes, initialEdges: layoutedEdges };
  }, [contracts]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900">Lineage Explorer</h2>
        <p className="text-xs text-gray-500">Visualizing data contract dependencies across the repository.</p>
      </div>
      <div className="flex-1 bg-gray-50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default LineageView;
