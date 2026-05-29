const { buildIntMatrix } = require("../arrays/arrayInputBuilder");

function buildGraph({ paramName, inputRaw }) {
  // Leverage array builder to parse JSON and create the base int[][] matrix
  const matrixBuilt = buildIntMatrix({ paramName, inputRaw });

  // Add the GRAPH_EDGE tracing loop
  const edgeTraceLoop = 
    `\n        for (int __i = 0; __i < ${paramName}.length; __i++) {\n` +
    `          if (${paramName}[__i] != null) {\n` +
    `            for (int __j = 0; __j < ${paramName}[__i].length; __j++) {\n` +
    `              System.out.println("TRACE|GRAPH_EDGE|from=graphNode_" + __i + "|to=graphNode_" + ${paramName}[__i][__j]);\n` +
    `            }\n` +
    `          }\n` +
    `        }`;

  return {
    decl: matrixBuilt.decl + edgeTraceLoop,
    arg: matrixBuilt.arg,
    initialValue: { type: "Graph", adjacencyList: matrixBuilt.initialValue }
  };
}

function buildGraphList({ paramName, inputRaw }) {
  const { parseJsonLoose } = require("../arrays/arrayInputBuilder").__proto__ ? require("../../execution/runtime/inputUtils") : require("../../execution/runtime/inputUtils");
  
  const parsed = parseJsonLoose(inputRaw) || [];
  
  let decl = `java.util.List<java.util.List<Integer>> ${paramName} = new java.util.ArrayList<>();\n`;
  for (let i = 0; i < parsed.length; i++) {
    decl += `        __DSAInput.__DSATracedAdjacencyList __list_${paramName}_${i} = new __DSAInput.__DSATracedAdjacencyList(${i});\n`;
    for (let j = 0; j < parsed[i].length; j++) {
      decl += `        __list_${paramName}_${i}.add(${parsed[i][j]});\n`;
    }
    decl += `        ${paramName}.add(__list_${paramName}_${i});\n`;
  }

  return {
    decl,
    arg: paramName,
    initialValue: { type: "Graph", adjacencyList: parsed },
    wantsGraphList: true
  };
}

module.exports = {
  buildGraph,
  buildGraphList
};
