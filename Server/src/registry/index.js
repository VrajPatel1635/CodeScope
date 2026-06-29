const Arrays = require('./java/util/Arrays');
const Collections = require('./java/util/Collections');
const List = require('./java/util/List');
const Queue = require('./java/util/Queue');
const Deque = require('./java/util/Deque');
const Stack = require('./java/util/Stack');
const MapMod = require('./java/util/Map');
const HashMap = require('./java/util/HashMap');
const TreeMap = require('./java/util/TreeMap');
const SetMod = require('./java/util/Set');
const HashSet = require('./java/util/HashSet');
const TreeSet = require('./java/util/TreeSet');
const PriorityQueue = require('./java/util/PriorityQueue');
const LinkedList = require('./java/util/LinkedList');
const ArrayList = require('./java/util/ArrayList');
const ArrayDeque = require('./java/util/ArrayDeque');
const Scanner = require('./java/util/Scanner');

const Pattern = require('./java/util/regex/Pattern');
const Matcher = require('./java/util/regex/Matcher');

const File = require('./java/io/File');
const IOException = require('./java/io/IOException');

const MathClass = require('./java/lang/Math');

const allModules = [
    Arrays, Collections, List, Queue, Deque, Stack, 
    MapMod, HashMap, TreeMap, SetMod, HashSet, TreeSet, PriorityQueue, LinkedList, ArrayList, ArrayDeque, Scanner,
    Pattern, Matcher, File, IOException,
    MathClass
];

class JavaKnowledgeRegistry {
    constructor(modules) {
        this.modules = modules;
        
        // Lookup tables
        this.byClassName = new Map();
        this.byFqn = new Map();

        this._initializeLookupTables();
        this.validateRegistry();
    }

    validateRegistry() {
        const seenFqns = new Set();
        const seenClassNames = new Set();

        for (const mod of this.modules) {
            if (!mod.namespace || !mod.className) {
                throw new Error(`Registry Validation Error: Module is missing namespace or className.`);
            }

            if (seenFqns.has(mod.fqn)) {
                throw new Error(`Registry Validation Error: Duplicate FQN detected: ${mod.fqn}`);
            }
            if (seenClassNames.has(mod.className)) {
                throw new Error(`Registry Validation Error: Duplicate ClassName detected: ${mod.className}`);
            }
            
            seenFqns.add(mod.fqn);
            seenClassNames.add(mod.className);

            if (mod.methods) {
                for (const [methodName, meta] of Object.entries(mod.methods)) {
                    if (typeof meta.mutatesTarget !== 'boolean') {
                        throw new Error(`Registry Validation Error: Method ${mod.className}.${methodName} is missing or has invalid 'mutatesTarget' boolean.`);
                    }
                    if (meta.mutatesTarget && !meta.operation) {
                        throw new Error(`Registry Validation Error: Mutating method ${mod.className}.${methodName} must define an 'operation'.`);
                    }
                }
            }
        }
    }

    _initializeLookupTables() {
        for (const mod of this.modules) {
            const fqn = `${mod.namespace}.${mod.className}`;
            mod.fqn = fqn;
            
            // Generate full import statement
            mod.importStatement = `import ${fqn};`;
            
            // Normalize properties
            if (!mod.methods) mod.methods = {};
            if (!mod.implements) mod.implements = [];
            
            this.byClassName.set(mod.className, mod);
            this.byFqn.set(fqn, mod);
        }
    }

    /**
     * Resolves all methods for a given module, including inherited ones.
     */
    _getResolvedMethods(mod) {
        const methods = { ...mod.methods };
        
        if (mod.implements) {
            for (const ifaceName of mod.implements) {
                const ifaceMod = this.byClassName.get(ifaceName);
                if (ifaceMod) {
                    const ifaceMethods = this._getResolvedMethods(ifaceMod);
                    // Child methods override interface methods
                    Object.assign(methods, ifaceMethods, mod.methods);
                }
            }
        }
        
        return methods;
    }

    /**
     * Lookup a class by its simple name (e.g., "Arrays")
     */
    lookupByClassName(className) {
        return this.byClassName.get(className) || null;
    }

    /**
     * Lookup a class by its fully qualified name (e.g., "java.util.Arrays")
     */
    lookupByFqn(fqn) {
        return this.byFqn.get(fqn) || null;
    }

    /**
     * Check if a class exists
     */
    hasClass(className) {
        return this.byClassName.has(className);
    }

    /**
     * Check if a method exists on a specific class
     */
    hasMethod(className, methodName) {
        const mod = this.lookupByClassName(className);
        if (!mod) return false;
        
        const resolvedMethods = this._getResolvedMethods(mod);
        return Object.prototype.hasOwnProperty.call(resolvedMethods, methodName);
    }

    /**
     * Lookup method metadata for a specific class
     */
    lookupMethod(className, methodName) {
        const mod = this.lookupByClassName(className);
        if (!mod) return null;
        
        const resolvedMethods = this._getResolvedMethods(mod);
        return resolvedMethods[methodName] || null;
    }

    /**
     * Get a list of all registered libraries (FQN)
     */
    listAllLibraries() {
        return Array.from(this.byFqn.keys());
    }
}

const registryInstance = new JavaKnowledgeRegistry(allModules);

module.exports = registryInstance;
