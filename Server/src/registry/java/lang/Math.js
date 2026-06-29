const { OPERATIONS } = require("../../constants");

module.exports = {
    namespace: "java.lang",
    className: "Math",
    isInterface: false,
    methods: {
        max: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        min: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        abs: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        pow: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        sqrt: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        floor: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        ceil: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH },
        round: { mutatesTarget: false, returnsValue: true, operation: OPERATIONS.MATH }
    }
};
