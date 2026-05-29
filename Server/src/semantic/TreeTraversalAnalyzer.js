/**
 * TreeTraversalAnalyzer.js
 *
 * Semantic Interpretation Layer — analyzes states to derive detailed Tree traversal
 * reasoning semantics without mutating the authoritative execution state.
 */

"use strict";

function getActiveTreeNode(frameVars) {
  if (!frameVars) return null;
  for (const key in frameVars) {
    if (typeof frameVars[key] === 'string' && (frameVars[key].startsWith('treeNode_') || frameVars[key].startsWith('node_'))) {
      return frameVars[key];
    }
  }
  return null;
}

function analyzeTreeTraversal(states) {
  if (!Array.isArray(states) || states.length === 0) return [];

  const semanticFrames = [];
  let pendingParentRestore = false;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const semantics = [];
    const treeState = state.tree;

    const currentStack = state.stack || [];
    const currentFrame = currentStack.length > 0 ? currentStack[currentStack.length - 1] : null;
    const parentFrame = currentStack.length > 1 ? currentStack[currentStack.length - 2] : null;
    
    const currentNode = getActiveTreeNode(currentFrame?.variables);
    const parentNode = getActiveTreeNode(parentFrame?.variables);

    // 1. PARENT_RESTORE and ROOT_REVISIT
    if (pendingParentRestore && state.type !== "RETURN") {
      if (currentNode) {
        semantics.push({
          type: "PARENT_RESTORE",
          nodeId: currentNode
        });

        if (treeState && treeState.root === currentNode) {
          semantics.push({
            type: "ROOT_REVISIT",
            nodeId: currentNode
          });
        }
      }
      pendingParentRestore = false;
    }

    // 2. Tree Visit Events
    if (state.treeVisitEvent) {
      const { phase, node } = state.treeVisitEvent;

      if (phase === "PREORDER") {
        if (treeState && treeState.nodes[node]) {
          const nodeObj = treeState.nodes[node];
          if (!nodeObj.left && !nodeObj.right) {
            semantics.push({
              type: "LEAF_NODE_REACHED",
              nodeId: node
            });
          }
        }

        if (parentNode && treeState && treeState.nodes[parentNode]) {
          if (treeState.nodes[parentNode].left === node) {
            semantics.push({
              type: "LEFT_SUBTREE_ACTIVE",
              nodeId: node,
              parentNodeId: parentNode
            });
          } else if (treeState.nodes[parentNode].right === node) {
            semantics.push({
              type: "RIGHT_SUBTREE_ACTIVE",
              nodeId: node,
              parentNodeId: parentNode
            });
          }
        }
      } else if (phase === "INORDER") {
        semantics.push({
          type: "CURRENT_NODE_PROCESSING",
          nodeId: node
        });
        semantics.push({
          type: "RECURSIVE_BRANCH_SWITCH",
          nodeId: node
        });
      }
    }

    // 4. SUBTREE_RETURNING
    if (state.type === "RETURN" && state.returnFlow) {
      const prevState = states[i - 1];
      const returningNode = getActiveTreeNode(prevState?.stack?.[prevState?.stack?.length - 1]?.variables);
      const targetParentNode = getActiveTreeNode(prevState?.stack?.[prevState?.stack?.length - 2]?.variables);

      if (targetParentNode || returningNode) {
        semantics.push({
          type: "SUBTREE_RETURNING",
          nodeId: returningNode,
          parentNodeId: targetParentNode,
          returnedValue: state.return
        });
      }
      
      pendingParentRestore = true;
    }

    semanticFrames.push({ step: state.step, semantics });
  }

  return semanticFrames;
}

module.exports = { analyzeTreeTraversal };
