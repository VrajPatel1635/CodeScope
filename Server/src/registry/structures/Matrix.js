module.exports = {
    namespace: "structure",
    className: "Matrix",
    structureType: "Matrix",
    matches: (type) => type && type.endsWith("[][]")
};
