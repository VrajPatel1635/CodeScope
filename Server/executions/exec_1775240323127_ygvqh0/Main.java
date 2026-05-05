
for(int i = 0; i < arr.length; i++) {
    arr[i] = arr[i] * 2;
}




public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        int[] arr = new int[]{1,2,3};
        
        int result = sol.solve(arr);
        System.out.println(result);
    }
}
