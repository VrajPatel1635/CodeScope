
class Solution {
  public int solve(int[][] grid) {

System.out.println("TRACE|CALL|solve");
System.out.println("TRACE|VAR|grid|" + java.util.Arrays.deepToString(grid));
System.out.println("TRACE|LINE|1");
int sum = 0;
System.out.println("TRACE|VAR|sum|" + sum);
for (int i = 0; i < grid.length; i++) {
System.out.println("TRACE|LINE|2");
System.out.println("TRACE|VAR|i|" + i);
System.out.println("TRACE|LOOP|loop_2|" + i);
System.out.println("TRACE|LINE|3");
if (i >= 0) {
for (int j = 0; j < grid[0].length; j++) {
System.out.println("TRACE|LINE|4");
System.out.println("TRACE|VAR|j|" + j);
System.out.println("TRACE|LOOP|loop_4|" + j);
System.out.println("TRACE|LINE|5");
sum += grid[i][j];
System.out.println("TRACE|VAR|sum|" + sum);
}
System.out.println("TRACE|LINE|6");
System.out.println("TRACE|VAR|j|null");
}
}
System.out.println("TRACE|LINE|8");
System.out.println("TRACE|VAR|i|null");
System.out.println("TRACE|LINE|9");
var trace_return = sum;
System.out.println("TRACE|VAR|__return__|" + trace_return);
System.out.println("TRACE|RETURN|" + trace_return);
return trace_return;

  }
}



public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        int[][] grid = new int[][]{{1,2},{3,4}};
        int result = sol.solve(grid);
        System.out.println(result);
    }
}
