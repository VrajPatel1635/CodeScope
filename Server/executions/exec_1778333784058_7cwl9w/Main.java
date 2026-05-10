


class ListNode {
  int val;
  ListNode next;
  ListNode(int val) {
    this.val = val;
    this.next = null;
  }
}

class __DSAInput {

  static java.util.IdentityHashMap<ListNode, String> nodeMap = new java.util.IdentityHashMap<>();
  static int nodeCount = 1;
  static String getNodeId(ListNode node) {
    if (node == null) return "null";
    if (!nodeMap.containsKey(node)) {
      nodeMap.put(node, "node_" + nodeCount++);
    }
    return nodeMap.get(node);
  }
  static String getNextId(ListNode node) {
    if (node == null) return "null";
    return getNodeId(node.next);
  }
  static String formatNode(Object o) {
    if (o != null && o.getClass().getName().equals("ListNode")) return getNodeId((ListNode)o);
    return String.valueOf(o);
  }

  static ListNode buildLinkedList(int[] vals) {
    if (vals == null || vals.length == 0) return null;
    ListNode head = new ListNode(vals[0]);
    getNodeId(head);
    ListNode cur = head;
    for (int i = 1; i < vals.length; i++) {
      cur.next = new ListNode(vals[i]);
      getNodeId(cur.next);
      System.out.println("TRACE|NODE_LINK|" + getNodeId(cur) + "|" + getNodeId(cur.next));
      cur = cur.next;
    }
    return head;
  }

}



class OutputSerializer {
    public static String serialize(Object obj) {
        if (obj == null) return "[]"; // or "null"? The spec asks for [] for Empty list
        if (obj instanceof int[]) {
            return java.util.Arrays.toString((int[]) obj);
        }
        if (obj instanceof int[][]) {
            return java.util.Arrays.deepToString((int[][]) obj);
        }
        if (obj.getClass().getSimpleName().equals("ListNode")) {
            return serializeLinkedList(obj);
        }
        return String.valueOf(obj);
    }

    private static String serializeLinkedList(Object headObj) {
        if (headObj == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        java.util.Set<Object> visited = java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>());
        Object curr = headObj;
        try {
            while (curr != null) {
                if (visited.contains(curr)) {
                    sb.append("\"CYCLE\"");
                    break;
                }
                visited.add(curr);
                
                java.lang.reflect.Field valField = curr.getClass().getDeclaredField("val");
                valField.setAccessible(true);
                sb.append(valField.get(curr));
                
                java.lang.reflect.Field nextField = curr.getClass().getDeclaredField("next");
                nextField.setAccessible(true);
                curr = nextField.get(curr);
                
                if (curr != null) {
                    sb.append(",");
                }
            }
        } catch (Exception e) {
            return "Error serializing ListNode";
        }
        sb.append("]");
        return sb.toString();
    }
}

class Solution {

    public ListNode solve(ListNode head) {
System.out.println("TRACE|CALL|solve");
System.out.println("TRACE|VAR|head|" + __DSAInput.formatNode(head));
System.out.println("TRACE|LINE|2");
var trace_return = reverse(head);
System.out.println("TRACE|VAR|__return__|" + __DSAInput.formatNode(trace_return));
System.out.println("TRACE|RETURN|" + __DSAInput.formatNode(trace_return));
return trace_return;

}

    private ListNode reverse(ListNode node) {
System.out.println("TRACE|CALL|reverse");
System.out.println("TRACE|VAR|node|" + __DSAInput.formatNode(node));
System.out.println("TRACE|LINE|3");
if (node == null || node.next == null) {
System.out.println("TRACE|LINE|4");
var trace_return = node;
System.out.println("TRACE|VAR|__return__|" + __DSAInput.formatNode(trace_return));
System.out.println("TRACE|RETURN|" + __DSAInput.formatNode(trace_return));
return trace_return;
}
System.out.println("TRACE|LINE|7");
ListNode newHead = reverse(node.next);
System.out.println("TRACE|VAR|newHead|" + __DSAInput.formatNode(newHead));
System.out.println("TRACE|LINE|9");
node.next.next = node;
System.out.println("TRACE|NODE_MUTATE|" + __DSAInput.getNodeId(node.next) + "|" + __DSAInput.getNodeId(node));
System.out.println("TRACE|LINE|10");
node.next = null;
System.out.println("TRACE|NODE_MUTATE|" + __DSAInput.getNodeId(node) + "|null");
System.out.println("TRACE|LINE|12");
var trace_return = newHead;
System.out.println("TRACE|VAR|__return__|" + __DSAInput.formatNode(trace_return));
System.out.println("TRACE|RETURN|" + __DSAInput.formatNode(trace_return));
return trace_return;

}
}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        int[] __vals_head = new int[]{1,2,3,4};
        ListNode head = __DSAInput.buildLinkedList(__vals_head);
        ListNode result = sol.solve(head);
        System.out.println(OutputSerializer.serialize(result));
    }
}
