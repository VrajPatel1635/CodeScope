
class Solution {
    public int solve(int[] arr) {

for(int i = 0; i < arr.length; i++) {
System.out.println("TRACE|LINE|1");
System.out.println("TRACE|VAR|i|" + i);
System.out.println("TRACE|LINE|2");
arr[i] = arr[i] * 2;
System.out.println("TRACE|ARRAY|arr|" + i + "|" + arr[i]);
}
System.out.println("TRACE|LINE|4");
var trace_return = arr[0];
System.out.println("TRACE|VAR|__return__|" + trace_return);
System.out.println("TRACE|RETURN|" + trace_return);
return trace_return;

    }
}


public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        int[] arr = new int[]{1,2,3};
        
        int result = sol.solve(arr);
        System.out.println(result);
    }
}
