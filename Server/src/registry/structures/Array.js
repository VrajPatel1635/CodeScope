module.exports = {
    namespace: "structure",
    className: "Array",
    structureType: "Array",
    matches: (type) => type && type.endsWith("[]") && !type.endsWith("[][]")
};
