import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  removeElements, 
  addEdge, 
  Controls, 
  Background,
  Handle 
} from 'react-flow-renderer';
import { Container, Button, Badge } from 'react-bootstrap';
import dagre from 'dagre';

function ChatFlowDesigner() {
  const [isLoading, setIsLoading] = useState(true);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editNodeId, setEditNodeId] = useState(null);
  const [formData, setFormData] = useState({ message: '', next: '', options: '', responseType: 'auto' });

  const getLayoutedElements = (elements, useStoredPositions = true) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    dagreGraph.setGraph({ 
      rankdir: 'TB',
      ranksep: 150,
      nodesep: 100,
      align: 'UL'
    });

    elements.forEach((el) => {
      if (el.data) {
        dagreGraph.setNode(el.id, { 
          width: 280,
          height: 200
        });
      } else {
        dagreGraph.setEdge(el.source, el.target);
      }
    });

    dagre.layout(dagreGraph);

    return elements.map((el) => {
      if (el.data) {
        if (useStoredPositions && el.data.position) {
          return {
            ...el,
            position: el.data.position
          };
        }
        
        const nodeWithPosition = dagreGraph.node(el.id);
        return {
          ...el,
          position: {
            x: nodeWithPosition.x - 140,
            y: nodeWithPosition.y - 100
          }
        };
      }
      return el;
    });
  };

  const [elements, setElements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/chatflow')
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!res.ok) {
            throw new Error(data.error || `HTTP error! status: ${res.status}`);
          }
          return data;
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Expected array of chat flow nodes');
        }
        
        console.log('Received chat flow data:', data);
        
        const nodes = data.map(node => ({
          id: node.id.toString(),
          type: 'custom',
          position: node.position || { x: 0, y: 0 },
          data: { 
            id: node.id.toString(),
            message: node.message,
            next: node.next ? node.next.toString() : 'None',
            options: node.options ? node.options.map(opt => ({
              ...opt,
              next: opt.next.toString()
            })) : null,
            position: node.position,
            responseType: node.responseType || 'auto'
          }
        }));

        console.log('Created nodes:', nodes);

        const edges = data.flatMap(node => {
          if (node.options) {
            return node.options.map(opt => ({
              id: `e${node.id}-${opt.next}`,
              source: `${node.id}`,
              target: `${opt.next}`,
              animated: true,
              label: opt.response,
              arrowHeadType: 'arrowclosed',
              style: { strokeWidth: 2 },
              markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20
              }
            }));
          } else if (node.next) {
            return [{
              id: `e${node.id}-${node.next}`,
              source: `${node.id}`,
              target: `${node.next}`,
              animated: true,
              arrowHeadType: 'arrowclosed',
              style: { strokeWidth: 2 },
              markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20
              }
            }];
          }
          return [];
        });

        const layoutedElements = getLayoutedElements([...nodes, ...edges]);
        setElements(layoutedElements);
        setIsLoading(false);
      })
      .catch(error => {
        setError(`Failed to load chat flow: ${error.message}`);
        console.error('Error fetching chat flow:', error);
        setIsLoading(false);
      });
  }, []);

  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params) =>
    setElements((els) => addEdge(params, els));

  const onNodeDragStop = (event, node) => {
    setElements((els) =>
      els.map((el) => {
        if (el.id === node.id) {
          return {
            ...el,
            position: node.position,
            data: {
              ...el.data,
              position: node.position
            }
          };
        }
        return el;
      })
    );
  };

  const handleSave = () => {
    const nodes = elements.filter(el => el.data).map(el => ({
      id: parseInt(el.id),
      message: el.data.message,
      position: el.position,
      ...(el.data.options && { options: el.data.options }),
      ...(el.data.next !== 'None' && { next: parseInt(el.data.next) }),
      responseType: el.data.responseType
    }));

    fetch('http://localhost:5000/api/chatflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodes)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }
        return data;
      })
      .then(() => alert('Chat flow saved!'))
      .catch(error => {
        setError(`Failed to save chat flow: ${error.message}`);
        console.error('Error saving chat flow:', error);
      });
  };

  const handleAddNode = () => {
    setFormData({ message: '', next: '', options: '', responseType: 'auto' });
    setEditNodeId(null);
    setShowNodeModal(true);
  };

  const handleEditNode = (nodeId) => {
    if (isLoading || elements.length === 0) {
      console.error("Cannot edit while loading or no elements available");
      return;
    }

    console.log("Edit request for node:", nodeId);
    console.log("Available elements:", elements);
    
    const node = elements.find(el => el.id === nodeId.toString());
    
    if (!node || !node.data) {
      console.error("Failed to find node:", nodeId);
      console.log("Available node IDs:", elements.map(el => el.id));
      return;
    }

    console.log("Found node to edit:", node);
    
    setFormData({
      message: node.data.message,
      next: node.data.next !== 'None' ? node.data.next : '',
      options: node.data.options
        ? node.data.options.map(opt => `${opt.response}:${opt.next}`).join(',')
        : '',
      responseType: node.data.responseType || 'auto'
    });
    setEditNodeId(nodeId.toString());
    setShowNodeModal(true);
  };

  const handleDeleteNode = (nodeId) => {
    setElements((prev) => removeElements(prev.filter(el => el.id === nodeId), prev));
  };

  const saveNodeChanges = () => {
    if (!formData.message.trim()) return;
    
    console.log("Saving changes for node:", editNodeId);
    console.log("Form data:", formData);
  
    const parsedOptions = formData.options
      ? formData.options.split(',').map((item) => {
          const [response, nextVal] = item.split(':').map((s) => s.trim());
          return { response, next: nextVal.toString() };
        })
      : null;
  
    if (editNodeId) {
      setElements((prev) => {
        const updated = prev.map((el) => {
          if (el.id === editNodeId || el.id === editNodeId.toString()) {
            console.log("Updating node:", el.id);
            return {
              ...el,
              data: {
                ...el.data,
                message: formData.message,
                next: formData.next || 'None',
                options: parsedOptions,
                responseType: formData.responseType
              }
            };
          }
          return el;
        });
        return getLayoutedElements(updated);
      });
    } else {
      const maxId = elements.reduce((acc, el) => {
        if (el.data && parseInt(el.data.id) > acc) return parseInt(el.data.id);
        return acc;
      }, 0);
      const newId = (maxId + 1).toString();
      setElements((prev) => {
        const newNode = {
          id: newId,
          type: 'custom',
          data: {
            id: newId,
            message: formData.message,
            next: formData.next || 'None',
            options: parsedOptions,
            responseType: formData.responseType
          },
          position: { x: 50, y: 50 }
        };
        return getLayoutedElements([...prev, newNode]);
      });
    }
  
    setShowNodeModal(false);
  };

  const CustomNode = ({ data }) => {
    return (
      <div style={{
        padding: '10px',
        borderRadius: '5px',
        background: 'white',
        border: '1px solid #777',
        width: 280,
        position: 'relative'
      }}>
        <button
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'none'
          }}
          className="delete-button btn btn-sm btn-danger"
          onClick={() => handleDeleteNode(data.id)}
        >
          X
        </button>
        <Handle type="target" position="top" style={{ background: '#555' }} />
        <div style={{ 
          borderBottom: '1px solid #eee', 
          padding: '5px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ID: {data.id}
        </div>
        <div style={{ 
          padding: '10px',
          minHeight: '60px',
          borderBottom: '1px solid #eee'
        }}>
          {data.message}
        </div>
        <div style={{ 
          padding: '5px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #eee',
          fontSize: '0.8em'
        }}>
          Response Type: {data.responseType || 'auto'}
        </div>
        {data.options ? (
          <div style={{ 
            padding: '10px',
            borderBottom: '1px solid #eee'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Responses:</div>
            {data.options.map((opt, idx) => (
              <div key={idx} style={{ 
                margin: '3px 0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Badge variant="info">{opt.response}</Badge>
                <span>→ Node {opt.next}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '5px',
            textAlign: 'center',
            color: '#666'
          }}>
            Next: {data.next || 'None'}
          </div>
        )}
        <button
          className="btn btn-sm btn-warning mt-2"
          onClick={() => handleEditNode(data.id.toString())}
        >
          Edit
        </button>
        <Handle type="source" position="bottom" style={{ background: '#555' }} />
      </div>
    );
  };

  return (
    <Container fluid className="vh-100">
      {error && <div className="alert alert-danger">{error}</div>}
      {isLoading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Button onClick={handleSave} className="mb-2">Save ChatFlow</Button>
          <Button onClick={handleAddNode} className="mb-2">Add Node</Button>
          <div style={{ height: '90%' }}>
            <ReactFlow
              elements={elements}
              onNodeDragStop={onNodeDragStop}
              onElementsRemove={onElementsRemove}
              onConnect={onConnect}
              nodeTypes={{ custom: CustomNode }}
              deleteKeyCode={46}
              snapToGrid={true}
              snapGrid={[15, 15]}
              defaultZoom={0.7}
              minZoom={0.2}
              maxZoom={1.5}
            >
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </>
      )}
      {showNodeModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editNodeId ? 'Edit Node' : 'Add Node'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowNodeModal(false)}></button>
              </div>
              <div className="modal-body">
                <label>Message:</label>
                <input
                  className="form-control mb-2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
                
                <label>Response Type:</label>
                <select
                  className="form-control mb-2"
                  value={formData.responseType || 'auto'}
                  onChange={(e) => setFormData({ ...formData, responseType: e.target.value })}
                >
                  <option value="auto">Auto (No user input)</option>
                  <option value="buttons">Buttons</option>
                  <option value="text">Text Input</option>
                </select>

                <label>Optional Next:</label>
                <input
                  className="form-control mb-2"
                  value={formData.next}
                  onChange={(e) => setFormData({ ...formData, next: e.target.value })}
                />
                
                <label>Responses (format: YES:2,NO:3):</label>
                <input
                  className="form-control mb-2"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNodeModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={saveNodeChanges}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ChatFlowDesigner;
